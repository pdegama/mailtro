package routers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/pdegama/mailtroapp/pkg/handlers"
)

// Setup configures all the application routes/endpoints on the Fiber app.
func Setup(app *fiber.App, db *gorm.DB) {
	// Health Check Endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
		})
	})

	// API Routes Setup
	authHandler := handlers.NewAuthHandler(db)
	userHandler := handlers.NewUserHandler(db)

	emailHandler := handlers.NewEmailHandler(db)

	// api
	api := app.Group("/api")

	// tmp
	api.Get("/emails", emailHandler.ListEmails)
	api.Post("/emails", emailHandler.CreateEmail)
	api.Delete("/emails/:id", emailHandler.DeleteEmail)

	// Auth routes
	api.Post("/auth/register", authHandler.RegisterUser)
	api.Post("/auth/login", authHandler.LoginUser)
	api.Get("/auth/exists/:username", authHandler.CheckUserExists)

	// profile
	api.Get("/profile", authHandler.AuthRequired, userHandler.GetProfile)
}
