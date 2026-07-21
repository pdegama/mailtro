package mail

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
	"gorm.io/gorm"

	"github.com/pdegama/mailtroapp/pkg/config"
	"github.com/pdegama/mailtroapp/pkg/mailer"
	"github.com/pdegama/mailtroapp/pkg/models"
	"github.com/pdegama/mailtroapp/pkg/queue"
	domainsvc "github.com/pdegama/mailtroapp/pkg/service/domain"
)

type Service struct {
	DB     *gorm.DB
	Cfg    *config.Config
	Queue  *queue.Queue
	Domain *domainsvc.Service
}

// StartWorkers launches the receiver consumer, the status consumer and the
// retry scheduler. Call once from main.
func (s *Service) StartWorkers() {
	go s.Queue.Consume(s.Cfg.QueueReceiver, s.handleIncoming)
	go s.Queue.Consume(s.Cfg.QueueStatus, s.handleStatus)
	go s.retryLoop()
	log.Printf("mail workers started (receiver=%s sender=%s status=%s)",
		s.Cfg.QueueReceiver, s.Cfg.QueueSender, s.Cfg.QueueStatus)
}

// --- incoming ---

// handleIncoming processes one message from the box receiver queue: verify
// DKIM, resolve each rcpt to a local mailbox and store the mail unread.
func (s *Service) handleIncoming(body []byte) error {
	var in mailer.IncomingMail
	if err := yaml.Unmarshal(body, &in); err != nil {
		return fmt.Errorf("bad receiver message: %w", err)
	}

	dkimStatus := mailer.VerifyDKIM(in.Data)

	parsed, err := mailer.Parse(in.Data)
	if err != nil {
		log.Printf("uid=%s: unparsable mail from %s: %v", in.UID, in.From, err)
		parsed = &mailer.ParsedMail{Subject: "(unreadable message)", FromAddr: strings.ToLower(in.From)}
	}

	fromAddr := parsed.FromAddr
	if fromAddr == "" {
		fromAddr = strings.ToLower(in.From)
	}

	delivered := 0
	for _, rcpt := range in.Recipients {
		userID, tag, err := s.Domain.ResolveMailbox(rcpt)
		if err != nil {
			// mailbox doesn't exist here — skip this rcpt
			log.Printf("uid=%s: drop rcpt %s: %v", in.UID, rcpt, err)
			continue
		}

		m := models.Mail{
			UserID:      userID,
			UID:         in.UID,
			Mailbox:     models.MailboxInbox,
			FromAddress: fromAddr,
			FromName:    parsed.FromName,
			ToAddress:   strings.ToLower(rcpt),
			Tag:         tag,
			Subject:     parsed.Subject,
			Snippet:     mailer.Snippet(firstNonEmpty(parsed.Text, parsed.HTML), 140),
			BodyText:    parsed.Text,
			BodyHTML:    parsed.HTML,
			RawData:     in.Data,
			MessageID:   parsed.MessageID,
			SPFStatus:   strings.ToUpper(in.SPFStatus),
			DKIMStatus:  dkimStatus,
			Unread:      true,
			Status:      models.MailStatusReceived,
		}
		if err := s.DB.Create(&m).Error; err != nil {
			return fmt.Errorf("store mail uid=%s: %w", in.UID, err)
		}
		delivered++
	}

	log.Printf("uid=%s: delivered to %d/%d rcpts (spf=%s dkim=%s)",
		in.UID, delivered, len(in.Recipients), in.SPFStatus, dkimStatus)
	return nil
}

// --- outgoing ---

type SendRequest struct {
	From    string
	To      string
	Subject string
	Text    string
	HTML    string
}

// Send validates the sender mailbox belongs to the user, builds and
// DKIM-signs the message, stores it in "sent" and publishes to the sender
// queue for the box client.
func (s *Service) Send(user *models.Users, req *SendRequest) (*models.Mail, error) {
	fromAddr := strings.ToLower(strings.TrimSpace(req.From))
	toAddr := strings.ToLower(strings.TrimSpace(req.To))

	_, _, domainName, err := domainsvc.SplitAddress(fromAddr)
	if err != nil {
		return nil, errors.New("invalid from address")
	}
	if _, _, _, err := domainsvc.SplitAddress(toAddr); err != nil {
		return nil, errors.New("invalid to address")
	}

	// sender must own the mailbox: verified domain + username or alias match
	d, err := s.Domain.VerifiedByName(domainName)
	if err != nil {
		return nil, fmt.Errorf("domain %s is not verified — verify it in settings first", domainName)
	}
	ownerID, _, err := s.Domain.ResolveMailbox(fromAddr)
	if err != nil || ownerID != user.ID {
		return nil, fmt.Errorf("mailbox %s does not belong to you", fromAddr)
	}

	uid := newUID()
	raw := mailer.Build(&mailer.Draft{
		FromName: user.Fullname,
		FromAddr: fromAddr,
		To:       toAddr,
		Subject:  req.Subject,
		Text:     req.Text,
		HTML:     req.HTML,
	}, s.Cfg.MailHostname, uid)

	signed, err := mailer.Sign(raw, d.Name, d.DKIMSelector, d.DKIMPrivateKey)
	if err != nil {
		return nil, err
	}

	m := models.Mail{
		UserID:      user.ID,
		UID:         uid,
		Mailbox:     models.MailboxSent,
		FromAddress: fromAddr,
		FromName:    user.Fullname,
		ToAddress:   toAddr,
		Subject:     req.Subject,
		Snippet:     mailer.Snippet(firstNonEmpty(req.Text, req.HTML), 140),
		BodyText:    req.Text,
		BodyHTML:    req.HTML,
		RawData:     signed,
		MessageID:   fmt.Sprintf("<%s@%s>", uid, s.Cfg.MailHostname),
		Unread:      false,
		Status:      models.MailStatusQueued,
	}
	if err := s.DB.Create(&m).Error; err != nil {
		return nil, err
	}

	if err := s.publishOutgoing(&m); err != nil {
		s.DB.Model(&m).Updates(map[string]interface{}{
			"status": models.MailStatusFailed, "status_error": err.Error(),
		})
		return nil, fmt.Errorf("queue publish failed: %w", err)
	}
	return &m, nil
}

func (s *Service) publishOutgoing(m *models.Mail) error {
	out := mailer.OutgoingMail{
		UID:       m.UID,
		From:      m.FromAddress,
		Recipient: m.ToAddress,
		Data:      m.RawData,
	}
	body, err := yaml.Marshal(&out)
	if err != nil {
		return err
	}
	return s.Queue.Publish(s.Cfg.QueueSender, body)
}

// --- delivery status + retry ---

// handleStatus processes one message from the box status queue and updates
// the matching sent mail. TRYAGAIN schedules a re-publish after the
// configured delay; too many retries becomes FAIL.
func (s *Service) handleStatus(body []byte) error {
	var st mailer.DeliveryStatus
	if err := yaml.Unmarshal(body, &st); err != nil {
		return fmt.Errorf("bad status message: %w", err)
	}

	var m models.Mail
	if err := s.DB.Where("uid = ? AND mailbox = ?", st.UID, models.MailboxSent).First(&m).Error; err != nil {
		log.Printf("status for unknown uid=%s (%s)", st.UID, st.Status)
		return nil
	}

	var errText string
	for _, e := range st.Errors {
		errText += e.Error + "\n"
	}
	errText = strings.TrimSpace(errText)

	switch strings.ToUpper(st.Status) {
	case "SUCCESS":
		return s.DB.Model(&m).Updates(map[string]interface{}{
			"status": models.MailStatusDelivered, "status_error": "", "next_retry_at": nil,
		}).Error
	case "TRYAGAIN":
		if m.RetryCount >= s.Cfg.MaxRetries {
			return s.DB.Model(&m).Updates(map[string]interface{}{
				"status":       models.MailStatusFailed,
				"status_error": fmt.Sprintf("gave up after %d retries: %s", m.RetryCount, errText),
			}).Error
		}
		next := time.Now().Add(time.Duration(s.Cfg.RetryDelayMinutes) * time.Minute)
		return s.DB.Model(&m).Updates(map[string]interface{}{
			"status": models.MailStatusTryAgain, "status_error": errText, "next_retry_at": next,
		}).Error
	default: // FAIL
		return s.DB.Model(&m).Updates(map[string]interface{}{
			"status": models.MailStatusFailed, "status_error": errText,
		}).Error
	}
}

// retryLoop re-publishes TRYAGAIN mail once its delay has passed.
func (s *Service) retryLoop() {
	ticker := time.NewTicker(30 * time.Second)
	for range ticker.C {
		var due []models.Mail
		err := s.DB.Where("status = ? AND next_retry_at IS NOT NULL AND next_retry_at <= ?",
			models.MailStatusTryAgain, time.Now()).Find(&due).Error
		if err != nil {
			log.Printf("retry scan: %v", err)
			continue
		}
		for i := range due {
			m := &due[i]
			if err := s.publishOutgoing(m); err != nil {
				log.Printf("retry publish uid=%s: %v", m.UID, err)
				continue
			}
			s.DB.Model(m).Updates(map[string]interface{}{
				"status":        models.MailStatusQueued,
				"retry_count":   m.RetryCount + 1,
				"next_retry_at": nil,
			})
			log.Printf("uid=%s re-queued (attempt %d)", m.UID, m.RetryCount+1)
		}
	}
}

// --- mailbox reads ---

func (s *Service) List(userID uint, mailbox string, limit int) ([]models.Mail, error) {
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	q := s.DB.Where("user_id = ?", userID).
		Omit("body_text", "body_html", "raw_data").
		Order("created_at desc").Limit(limit)
	if mailbox != "" {
		q = q.Where("mailbox = ?", mailbox)
	}
	var mails []models.Mail
	err := q.Find(&mails).Error
	return mails, err
}

func (s *Service) Get(userID, mailID uint) (*models.Mail, error) {
	var m models.Mail
	if err := s.DB.Where("id = ? AND user_id = ?", mailID, userID).First(&m).Error; err != nil {
		return nil, errors.New("mail not found")
	}
	return &m, nil
}

func (s *Service) SetRead(userID, mailID uint, unread bool) error {
	res := s.DB.Model(&models.Mail{}).
		Where("id = ? AND user_id = ?", mailID, userID).
		Update("unread", unread)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("mail not found")
	}
	return nil
}

func (s *Service) UnreadCount(userID uint) (int64, error) {
	var n int64
	err := s.DB.Model(&models.Mail{}).
		Where("user_id = ? AND mailbox = ? AND unread = ?", userID, models.MailboxInbox, true).
		Count(&n).Error
	return n, err
}

// --- helpers ---

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}

func newUID() string {
	b := make([]byte, 5)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%d%s", time.Now().Unix(), hex.EncodeToString(b))
}
