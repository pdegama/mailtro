package models

import "time"

// Mailbox values
const (
	MailboxInbox = "inbox"
	MailboxSent  = "sent"
)

// Delivery status values for sent mail (mirrors box status queue semantics).
const (
	MailStatusReceived  = "received"
	MailStatusQueued    = "queued"
	MailStatusDelivered = "delivered"
	MailStatusTryAgain  = "tryagain"
	MailStatusFailed    = "failed"
)

type Mail struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	UserID uint   `gorm:"not null;index" json:"user_id"`
	UID    string `gorm:"type:varchar(128);index" json:"uid"`

	Mailbox string `gorm:"type:varchar(16);not null;index" json:"mailbox"`

	FromAddress string `gorm:"type:varchar(320);not null" json:"from_address"`
	FromName    string `gorm:"type:varchar(255)" json:"from_name"`
	ToAddress   string `gorm:"type:varchar(320);not null" json:"to_address"`
	// Tag from plus addressing on the delivered rcpt (user+tag@domain)
	Tag string `gorm:"type:varchar(255)" json:"tag"`

	Subject  string `gorm:"type:text" json:"subject"`
	Snippet  string `gorm:"type:text" json:"snippet"`
	BodyText string `gorm:"type:text" json:"body_text"`
	BodyHTML string `gorm:"type:text" json:"body_html"`
	RawData  string `gorm:"type:text" json:"-"`

	MessageID string `gorm:"type:varchar(998)" json:"message_id"`

	// Authentication results for received mail
	SPFStatus  string `gorm:"type:varchar(32)" json:"spf_status"`
	DKIMStatus string `gorm:"type:varchar(32)" json:"dkim_status"`

	Unread bool `gorm:"default:true" json:"unread"`

	// Delivery lifecycle for sent mail
	Status      string     `gorm:"type:varchar(16);index" json:"status"`
	StatusError string     `gorm:"type:text" json:"status_error,omitempty"`
	RetryCount  int        `gorm:"default:0" json:"retry_count"`
	NextRetryAt *time.Time `gorm:"index" json:"next_retry_at,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
