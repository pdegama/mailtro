package domain

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/pem"
	"errors"
	"fmt"
	"net"
	"regexp"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/pdegama/mailtroapp/pkg/config"
	"github.com/pdegama/mailtroapp/pkg/models"
)

var domainPattern = regexp.MustCompile(`^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$`)

type Service struct {
	DB  *gorm.DB
	Cfg *config.Config
}

// DNSRecord is one record the user must create on their domain.
type DNSRecord struct {
	Type    string `json:"type"`
	Host    string `json:"host"`
	Value   string `json:"value"`
	Purpose string `json:"purpose"`
}

// Normalize lowercases and trims a domain name.
func Normalize(name string) string {
	return strings.ToLower(strings.TrimSpace(strings.TrimSuffix(name, ".")))
}

func validateName(name string) error {
	if name == "" {
		return errors.New("domain is required")
	}
	if !domainPattern.MatchString(name) {
		return errors.New("invalid domain name")
	}
	return nil
}

// Add claims a domain for a user: generates the CNAME challenge token and a
// DKIM keypair. The claim stays unverified until Verify succeeds.
func (s *Service) Add(userID uint, name string) (*models.Domain, error) {
	name = Normalize(name)
	if err := validateName(name); err != nil {
		return nil, err
	}

	var existing models.Domain
	err := s.DB.Where("name = ? AND user_id = ?", name, userID).First(&existing).Error
	if err == nil {
		return &existing, nil // already claimed by this user
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	token, err := randomToken(12)
	if err != nil {
		return nil, err
	}

	selector, priv, pub, err := generateDKIM()
	if err != nil {
		return nil, err
	}

	d := models.Domain{
		Name:           name,
		UserID:         userID,
		VerifyToken:    token,
		DKIMSelector:   selector,
		DKIMPrivateKey: priv,
		DKIMPublicKey:  pub,
	}
	if err := s.DB.Create(&d).Error; err != nil {
		return nil, err
	}
	return &d, nil
}

// List returns the user's domain claims.
func (s *Service) List(userID uint) ([]models.Domain, error) {
	var domains []models.Domain
	err := s.DB.Where("user_id = ?", userID).Order("created_at asc").Find(&domains).Error
	return domains, err
}

func (s *Service) Get(userID, domainID uint) (*models.Domain, error) {
	var d models.Domain
	if err := s.DB.Where("id = ? AND user_id = ?", domainID, userID).First(&d).Error; err != nil {
		return nil, errors.New("domain not found")
	}
	return &d, nil
}

func (s *Service) Delete(userID, domainID uint) error {
	d, err := s.Get(userID, domainID)
	if err != nil {
		return err
	}
	if err := s.DB.Where("domain_id = ?", d.ID).Delete(&models.Alias{}).Error; err != nil {
		return err
	}
	return s.DB.Delete(d).Error
}

// Records returns every DNS record the user must add for a domain claim.
func (s *Service) Records(d *models.Domain) []DNSRecord {
	records := []DNSRecord{
		{
			Type:    "CNAME",
			Host:    "_mailtro." + d.Name,
			Value:   d.VerifyToken + "." + s.Cfg.VerifyZone,
			Purpose: "Proves you own this domain. Verification moves ownership to the latest verifier.",
		},
	}
	for _, mx := range s.Cfg.MXHosts {
		records = append(records, DNSRecord{
			Type:    "MX",
			Host:    d.Name,
			Value:   mx,
			Purpose: "Routes incoming mail to Mailtro.",
		})
	}
	records = append(records,
		DNSRecord{
			Type:    "TXT",
			Host:    d.Name,
			Value:   "v=spf1 include:" + s.Cfg.SPFInclude + " ~all",
			Purpose: "SPF — authorizes Mailtro servers to send for this domain.",
		},
		DNSRecord{
			Type:    "TXT",
			Host:    d.DKIMSelector + "._domainkey." + d.Name,
			Value:   "v=DKIM1; k=rsa; p=" + d.DKIMPublicKey,
			Purpose: "DKIM public key — receivers use it to verify your signatures.",
		},
	)
	return records
}

// Verify checks the CNAME challenge. On success this claim becomes the
// verified one and any other verified claim of the same name is revoked.
func (s *Service) Verify(userID, domainID uint) (*models.Domain, error) {
	d, err := s.Get(userID, domainID)
	if err != nil {
		return nil, err
	}

	expect := strings.ToLower(d.VerifyToken + "." + s.Cfg.VerifyZone)
	host := "_mailtro." + d.Name

	cname, err := net.LookupCNAME(host)
	if err != nil {
		return nil, fmt.Errorf("CNAME lookup failed for %s — record not found yet", host)
	}
	if Normalize(cname) != expect {
		return nil, fmt.Errorf("CNAME for %s points to %q, expected %q", host, Normalize(cname), expect)
	}

	now := time.Now()
	err = s.DB.Transaction(func(tx *gorm.DB) error {
		// new owner: revoke every other claim of this name
		if err := tx.Model(&models.Domain{}).
			Where("name = ? AND id <> ?", d.Name, d.ID).
			Updates(map[string]interface{}{"verified": false}).Error; err != nil {
			return err
		}
		return tx.Model(d).Updates(map[string]interface{}{"verified": true, "verified_at": now}).Error
	})
	if err != nil {
		return nil, err
	}
	d.Verified = true
	d.VerifiedAt = &now
	return d, nil
}

// VerifiedByName returns the currently verified claim for a domain name.
func (s *Service) VerifiedByName(name string) (*models.Domain, error) {
	var d models.Domain
	err := s.DB.Where("name = ? AND verified = ?", Normalize(name), true).First(&d).Error
	if err != nil {
		return nil, err
	}
	return &d, nil
}

// --- aliases ---

func (s *Service) AddAlias(userID, domainID uint, name string) (*models.Alias, error) {
	d, err := s.Get(userID, domainID)
	if err != nil {
		return nil, err
	}
	name = strings.ToLower(strings.TrimSpace(name))
	if name == "" || strings.Contains(name, "@") || strings.Contains(name, "+") {
		return nil, errors.New("alias must be a plain local part without @ or +")
	}
	a := models.Alias{DomainID: d.ID, Name: name, UserID: userID}
	if err := s.DB.Create(&a).Error; err != nil {
		return nil, errors.New("alias already exists on this domain")
	}
	return &a, nil
}

func (s *Service) ListAliases(userID, domainID uint) ([]models.Alias, error) {
	if _, err := s.Get(userID, domainID); err != nil {
		return nil, err
	}
	var aliases []models.Alias
	err := s.DB.Where("domain_id = ?", domainID).Order("created_at asc").Find(&aliases).Error
	return aliases, err
}

func (s *Service) DeleteAlias(userID, domainID, aliasID uint) error {
	if _, err := s.Get(userID, domainID); err != nil {
		return err
	}
	return s.DB.Where("id = ? AND domain_id = ?", aliasID, domainID).Delete(&models.Alias{}).Error
}

// --- mailbox resolution ---

// SplitAddress lowercases an address and splits it into base local part, +tag
// and domain: "Parth+news@Example.COM" -> ("parth", "news", "example.com").
func SplitAddress(addr string) (local, tag, domainName string, err error) {
	addr = strings.ToLower(strings.TrimSpace(addr))
	at := strings.LastIndex(addr, "@")
	if at <= 0 || at == len(addr)-1 {
		return "", "", "", fmt.Errorf("invalid address %q", addr)
	}
	local, domainName = addr[:at], addr[at+1:]
	if plus := strings.Index(local, "+"); plus >= 0 {
		tag = local[plus+1:]
		local = local[:plus]
	}
	return local, tag, domainName, nil
}

// ResolveMailbox finds the owning user for an incoming rcpt address.
// Rules: domain must be verified; if the domain owner's username matches the
// local part the owner gets the mail; otherwise an alias with that name on
// the domain wins; otherwise there is no such mailbox.
func (s *Service) ResolveMailbox(addr string) (userID uint, tag string, err error) {
	local, tag, name, err := SplitAddress(addr)
	if err != nil {
		return 0, "", err
	}

	d, err := s.VerifiedByName(name)
	if err != nil {
		return 0, "", fmt.Errorf("domain %s is not verified on this server", name)
	}

	// domain owner's username == local part → owner mailbox
	var owner models.Users
	if err := s.DB.First(&owner, d.UserID).Error; err == nil {
		if strings.ToLower(owner.Username) == local {
			return owner.ID, tag, nil
		}
	}

	// otherwise look for an alias on this domain
	var alias models.Alias
	if err := s.DB.Where("domain_id = ? AND name = ?", d.ID, local).First(&alias).Error; err == nil {
		return alias.UserID, tag, nil
	}

	return 0, "", fmt.Errorf("mailbox %s does not exist", addr)
}

// --- helpers ---

func randomToken(nBytes int) (string, error) {
	b := make([]byte, nBytes)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// generateDKIM creates a 2048-bit RSA keypair. The private key is stored as
// PEM; the public key as base64 DER for the p= tag of the DKIM TXT record.
// Selector embeds a timestamp so rotated keys never collide.
func generateDKIM() (selector, privPEM, pubB64 string, err error) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return "", "", "", err
	}

	privPEM = string(pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(key),
	}))

	pubDER, err := x509.MarshalPKIXPublicKey(&key.PublicKey)
	if err != nil {
		return "", "", "", err
	}
	pubB64 = base64.StdEncoding.EncodeToString(pubDER)

	selector = "mtro" + time.Now().UTC().Format("20060102")
	return selector, privPEM, pubB64, nil
}
