package models

import "time"

// Domain is a mail domain claimed by a user. A domain name can be claimed by
// multiple users, but only one row per name can be verified at a time — on a
// successful verification every other claim of the same name is un-verified,
// so ownership moves to the newest verifier.
type Domain struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Name   string `gorm:"type:varchar(255);not null;index;uniqueIndex:idx_domain_user" json:"name"`
	UserID uint   `gorm:"not null;uniqueIndex:idx_domain_user" json:"user_id"`

	Verified   bool       `gorm:"default:false" json:"verified"`
	VerifiedAt *time.Time `json:"verified_at,omitempty"`

	// CNAME challenge: _mailtro.<name> CNAME <VerifyToken>.<verify zone>
	VerifyToken string `gorm:"type:varchar(64);not null" json:"verify_token"`

	// DKIM keypair generated when the domain is added; selector is stored so
	// old selectors keep working if we rotate keys later.
	DKIMSelector   string `gorm:"type:varchar(64);not null" json:"dkim_selector"`
	DKIMPrivateKey string `gorm:"type:text;not null" json:"-"`
	DKIMPublicKey  string `gorm:"type:text;not null" json:"dkim_public_key"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Alias maps an extra local part on a domain to a user mailbox.
// e.g. hello@parthka.dev -> user "parth".
type Alias struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	DomainID uint   `gorm:"not null;uniqueIndex:idx_alias_domain_name" json:"domain_id"`
	Name     string `gorm:"type:varchar(255);not null;uniqueIndex:idx_alias_domain_name" json:"name"`
	UserID   uint   `gorm:"not null" json:"user_id"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
