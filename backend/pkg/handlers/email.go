package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/pdegama/mailtroapp/pkg/models"
)

type EmailHandler struct {
	DB *gorm.DB
}

func NewEmailHandler(db *gorm.DB) *EmailHandler {
	return &EmailHandler{DB: db}
}

// ListEmails handles GET /api/emails
func (h *EmailHandler) ListEmails(c *fiber.Ctx) error {
	var emails []models.EmailName
	if err := h.DB.Find(&emails).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch emails",
		})
	}
	return c.JSON(emails)
}

// CreateEmail handles POST /api/emails
func (h *EmailHandler) CreateEmail(c *fiber.Ctx) error {
	type Request struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse body",
		})
	}

	if req.Email == "" || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email and Name are required",
		})
	}

	emailName := models.EmailName{
		Email: req.Email,
		Name:  req.Name,
	}

	if err := h.DB.Create(&emailName).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create email record: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(emailName)
}

// DeleteEmail handles DELETE /api/emails/:id
func (h *EmailHandler) DeleteEmail(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var email models.EmailName
	if err := h.DB.First(&email, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Email record not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch email",
		})
	}

	if err := h.DB.Delete(&email).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete email record",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
