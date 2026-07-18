package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	authsvc "github.com/pdegama/mailtroapp/pkg/service/auth"
	usersvc "github.com/pdegama/mailtroapp/pkg/service/user"
)

type AuthHandler struct {
	DB      *gorm.DB
	Service *authsvc.Auth
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		DB: db,
		Service: &authsvc.Auth{
			DB: db,
			User: &usersvc.User{
				DB: db,
			},
		},
	}
}

// RegisterUser handles POST /api/auth/register
func (h *AuthHandler) RegisterUser(c *fiber.Ctx) error {
	type Request struct {
		Fullname string `json:"fullname"`
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "username and password required"})
	}

	user, token, err := h.Service.Register(&authsvc.AuthRegister{Username: req.Username, Password: req.Password, Fullname: req.Fullname})
	if err != nil {
		status := fiber.StatusInternalServerError
		if strings.Contains(err.Error(), "username") {
			status = fiber.StatusBadRequest
		}
		return c.Status(status).JSON(fiber.Map{"error": err.Error()})
	}
	user.Password = ""
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"user": user, "token": token})
}

// LoginUser handles POST /api/auth/login
func (h *AuthHandler) LoginUser(c *fiber.Ctx) error {
	type Request struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "username and password required"})
	}

	user, token, err := h.Service.Auth(&authsvc.AuthCred{Username: req.Username, Password: req.Password})
	if err != nil {
		status := fiber.StatusUnauthorized
		if strings.Contains(err.Error(), "username") {
			status = fiber.StatusBadRequest
		}
		return c.Status(status).JSON(fiber.Map{"error": err.Error()})
	}
	user.Password = ""
	return c.JSON(fiber.Map{"user": user, "token": token})
}

// CheckUserExists handles GET /api/auth/exists/:username
func (h *AuthHandler) CheckUserExists(c *fiber.Ctx) error {
	username := c.Params("username")
	if username == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "username required"})
	}
	exists, err := h.Service.UsernameExist(username)
	if err != nil {
		status := fiber.StatusInternalServerError
		if strings.Contains(err.Error(), "username") {
			status = fiber.StatusBadRequest
		}
		return c.Status(status).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"exists": exists})
}

// middleware to check if user is authenticated
func (h *AuthHandler) AuthRequired(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing or invalid authorization header"})
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token required"})
	}

	user, err := h.Service.GetUserFromToken(tokenString)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
	}

	user.Password = ""
	c.Locals("user", user)
	return c.Next()
}
