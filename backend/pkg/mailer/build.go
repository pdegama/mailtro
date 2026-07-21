package mailer

import (
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"html"
	"mime"
	"strings"
	"time"

	"github.com/emersion/go-msgauth/dkim"
)

// Draft is an outgoing message before it is rendered and signed.
type Draft struct {
	FromName string
	FromAddr string
	To       string
	Subject  string
	Text     string
	HTML     string
}

// Build renders a Draft into a raw RFC822 message (CRLF line endings,
// multipart/alternative when both text and html bodies exist).
func Build(d *Draft, hostname, uid string) string {
	var b strings.Builder
	writeln := func(line string) {
		b.WriteString(line)
		b.WriteString("\r\n")
	}

	from := d.FromAddr
	if d.FromName != "" {
		from = fmt.Sprintf("%s <%s>", mime.QEncoding.Encode("utf-8", d.FromName), d.FromAddr)
	}

	writeln("From: " + from)
	writeln("To: " + d.To)
	writeln("Subject: " + mime.QEncoding.Encode("utf-8", d.Subject))
	writeln("Message-ID: <" + uid + "@" + hostname + ">")
	writeln("Date: " + time.Now().UTC().Format(time.RFC1123Z))
	writeln("MIME-Version: 1.0")

	text := d.Text
	if text == "" {
		text = htmlToText(d.HTML)
	}

	if d.HTML == "" {
		writeln(`Content-Type: text/plain; charset=UTF-8`)
		writeln("")
		b.WriteString(crlf(text))
		writeln("")
		return b.String()
	}

	boundary := "mtro-" + uid
	writeln(`Content-Type: multipart/alternative; boundary="` + boundary + `"`)
	writeln("")
	writeln("--" + boundary)
	writeln(`Content-Type: text/plain; charset=UTF-8`)
	writeln("")
	b.WriteString(crlf(text))
	writeln("")
	writeln("--" + boundary)
	writeln(`Content-Type: text/html; charset=UTF-8`)
	writeln("")
	b.WriteString(crlf(d.HTML))
	writeln("")
	writeln("--" + boundary + "--")
	return b.String()
}

// Sign DKIM-signs a raw message with the domain's stored private key.
func Sign(raw, domainName, selector, privateKeyPEM string) (string, error) {
	block, _ := pem.Decode([]byte(privateKeyPEM))
	if block == nil {
		return "", errors.New("invalid DKIM private key PEM")
	}
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return "", fmt.Errorf("parse DKIM key: %w", err)
	}

	opts := &dkim.SignOptions{
		Domain:   domainName,
		Selector: selector,
		Signer:   key,
		HeaderKeys: []string{
			"From", "To", "Subject", "Date", "Message-ID", "MIME-Version", "Content-Type",
		},
	}

	var signed strings.Builder
	if err := dkim.Sign(&signed, strings.NewReader(crlf(raw)), opts); err != nil {
		return "", fmt.Errorf("dkim sign: %w", err)
	}
	return signed.String(), nil
}

// htmlToText is a rough plain-text fallback for the multipart alternative.
func htmlToText(s string) string {
	replacer := strings.NewReplacer("<br>", "\n", "<br/>", "\n", "<br />", "\n", "</p>", "\n\n", "</div>", "\n")
	s = replacer.Replace(s)
	var b strings.Builder
	inTag := false
	for _, r := range s {
		switch {
		case r == '<':
			inTag = true
		case r == '>':
			inTag = false
		case !inTag:
			b.WriteRune(r)
		}
	}
	return strings.TrimSpace(html.UnescapeString(b.String()))
}
