package mailer

import (
	"strings"

	"github.com/emersion/go-msgauth/dkim"
	"github.com/mnako/letters"
)

// DKIM verification results stored on received mail.
const (
	DKIMPass = "PASS"
	DKIMFail = "FAIL"
	DKIMNone = "NONE"
)

// ParsedMail is the useful subset of a raw RFC822 message.
type ParsedMail struct {
	Subject   string
	FromName  string
	FromAddr  string
	MessageID string
	Text      string
	HTML      string
}

// crlf normalizes line endings — DKIM verification requires CRLF, queue
// payloads may arrive with bare LF after YAML round-tripping.
func crlf(data string) string {
	return strings.ReplaceAll(strings.ReplaceAll(data, "\r\n", "\n"), "\n", "\r\n")
}

// VerifyDKIM checks every DKIM signature in the raw message.
// PASS if at least one signature verifies, FAIL if signatures exist but none
// verify, NONE if the message is unsigned.
func VerifyDKIM(raw string) string {
	verifications, err := dkim.Verify(strings.NewReader(crlf(raw)))
	if err != nil || len(verifications) == 0 {
		return DKIMNone
	}
	for _, v := range verifications {
		if v.Err == nil {
			return DKIMPass
		}
	}
	return DKIMFail
}

// Parse extracts headers and bodies from a raw message.
func Parse(raw string) (*ParsedMail, error) {
	email, err := letters.ParseEmail(strings.NewReader(crlf(raw)))
	if err != nil {
		return nil, err
	}

	p := &ParsedMail{
		Subject:   email.Headers.Subject,
		MessageID: string(email.Headers.MessageID),
		Text:      strings.TrimSpace(email.Text),
		HTML:      strings.TrimSpace(email.HTML),
	}
	if len(email.Headers.From) > 0 && email.Headers.From[0] != nil {
		p.FromName = email.Headers.From[0].Name
		p.FromAddr = strings.ToLower(email.Headers.From[0].Address)
	}
	return p, nil
}

// Snippet builds a short plain-text preview for list views.
func Snippet(text string, max int) string {
	text = strings.Join(strings.Fields(text), " ")
	runes := []rune(text)
	if len(runes) > max {
		return string(runes[:max]) + "…"
	}
	return text
}
