package mailer

import "time"

// Messages exchanged with box SMTP over RabbitMQ, in YAML.
// See box README: receiver / sender / status queues.

// IncomingMail is what the box server publishes on the receiver queue.
type IncomingMail struct {
	UID        string    `yaml:"uid"`
	Time       time.Time `yaml:"time"`
	Success    bool      `yaml:"success"`
	Cmds       string    `yaml:"cmds"`
	TLS        bool      `yaml:"tls"`
	Domain     string    `yaml:"domain"`
	PTRMatch   bool      `yaml:"ptr_match"`
	SPFFail    bool      `yaml:"spf_fail"`
	SPFStatus  string    `yaml:"spf_status"`
	From       string    `yaml:"from"`
	Recipients []string  `yaml:"recipients"`
	UseBdat    bool      `yaml:"use_bdat"`
	Data       string    `yaml:"data"`
}

// OutgoingMail is what we publish on the sender queue for the box client.
type OutgoingMail struct {
	UID       string `yaml:"uid"`
	From      string `yaml:"from"`
	Recipient string `yaml:"recipient"`
	Data      string `yaml:"data"`
}

// DeliveryStatus is what the box client publishes on the status queue.
type DeliveryStatus struct {
	Time           time.Time             `yaml:"time"`
	UID            string                `yaml:"uid"`
	Success        bool                  `yaml:"success"`
	Status         string                `yaml:"status"` // SUCCESS | TRYAGAIN | FAIL
	Errors         []DeliveryStatusError `yaml:"errors"`
	TempError      bool                  `yaml:"temperror"`
	AnyClientError bool                  `yaml:"anyclienterror"`
}

type DeliveryStatusError struct {
	Domain      string `yaml:"domain"`
	Error       string `yaml:"error"`
	Code        int    `yaml:"code"`
	ServerError bool   `yaml:"servererror"`
}
