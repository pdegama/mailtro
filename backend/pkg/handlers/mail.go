package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/pdegama/mailtroapp/pkg/models"
	mailsvc "github.com/pdegama/mailtroapp/pkg/service/mail"
)

type MailHandler struct {
	Service *mailsvc.Service
}

func NewMailHandler(service *mailsvc.Service) *MailHandler {
	return &MailHandler{Service: service}
}

func currentUser(c *fiber.Ctx) *models.Users {
	user, _ := c.Locals("user").(*models.Users)
	return user
}

func paramUint(c *fiber.Ctx, name string) (uint, error) {
	n, err := strconv.ParseUint(c.Params(name), 10, 32)
	return uint(n), err
}

// ListMails handles GET /api/mails?mailbox=inbox|sent&limit=n
func (h *MailHandler) ListMails(c *fiber.Ctx) error {
	user := currentUser(c)
	limit, _ := strconv.Atoi(c.Query("limit", "100"))
	mails, err := h.Service.List(user.ID, c.Query("mailbox"), limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch mails"})
	}
	unread, _ := h.Service.UnreadCount(user.ID)
	return c.JSON(fiber.Map{"mails": mails, "unread": unread})
}

// GetMail handles GET /api/mails/:id — full body, marks the mail read.
func (h *MailHandler) GetMail(c *fiber.Ctx) error {
	user := currentUser(c)
	id, err := paramUint(c, "id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	mail, err := h.Service.Get(user.ID, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	if mail.Unread {
		_ = h.Service.SetRead(user.ID, mail.ID, false)
		mail.Unread = false
	}
	return c.JSON(fiber.Map{"mail": mail})
}

// MarkUnread handles POST /api/mails/:id/unread
func (h *MailHandler) MarkUnread(c *fiber.Ctx) error {
	user := currentUser(c)
	id, err := paramUint(c, "id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	if err := h.Service.SetRead(user.ID, id, true); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"ok": true})
}

// SendMail handles POST /api/mails/send
func (h *MailHandler) SendMail(c *fiber.Ctx) error {
	user := currentUser(c)

	type Request struct {
		From    string `json:"from"`
		To      string `json:"to"`
		Subject string `json:"subject"`
		Text    string `json:"text"`
		HTML    string `json:"html"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.From == "" || req.To == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "from and to are required"})
	}
	if req.Subject == "" && req.Text == "" && req.HTML == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "message is empty"})
	}

	mail, err := h.Service.Send(user, &mailsvc.SendRequest{
		From: req.From, To: req.To, Subject: req.Subject, Text: req.Text, HTML: req.HTML,
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"mail": mail})
}
