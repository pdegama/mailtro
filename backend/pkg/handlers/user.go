package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/pdegama/mailtroapp/pkg/models"
	usersvc "github.com/pdegama/mailtroapp/pkg/service/user"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB      *gorm.DB
	Service *usersvc.User
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{DB: db}
}

func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(*models.Users)
	if !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "profile not found"})
	}

	return c.JSON(fiber.Map{"user": user})
}
