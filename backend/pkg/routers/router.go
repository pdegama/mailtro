package routers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/pdegama/mailtroapp/pkg/handlers"
	domainsvc "github.com/pdegama/mailtroapp/pkg/service/domain"
	mailsvc "github.com/pdegama/mailtroapp/pkg/service/mail"
	"github.com/pdegama/mailtroapp/static"
)

// Setup configures all the application routes/endpoints on the Fiber app.
func Setup(app *fiber.App, db *gorm.DB, domainService *domainsvc.Service, mailService *mailsvc.Service) {
	// Health Check Endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
		})
	})

	// API Routes Setup
	authHandler := handlers.NewAuthHandler(db)
	userHandler := handlers.NewUserHandler(db)
	domainHandler := handlers.NewDomainHandler(domainService)
	mailHandler := handlers.NewMailHandler(mailService)

	// setup static for frontend
	static.SetupStatic(app)

	// api
	api := app.Group("/api")

	// Auth routes
	api.Post("/auth/register", authHandler.RegisterUser)
	api.Post("/auth/login", authHandler.LoginUser)
	api.Get("/auth/exists/:username", authHandler.CheckUserExists)

	// profile
	api.Get("/profile", authHandler.AuthRequired, userHandler.GetProfile)

	// domains
	domains := api.Group("/domains", authHandler.AuthRequired)
	domains.Get("/", domainHandler.ListDomains)
	domains.Post("/", domainHandler.AddDomain)
	domains.Post("/:id/verify", domainHandler.VerifyDomain)
	domains.Delete("/:id", domainHandler.DeleteDomain)
	domains.Get("/:id/aliases", domainHandler.ListAliases)
	domains.Post("/:id/aliases", domainHandler.AddAlias)
	domains.Delete("/:id/aliases/:aliasId", domainHandler.DeleteAlias)

	// mails
	mails := api.Group("/mails", authHandler.AuthRequired)
	mails.Get("/", mailHandler.ListMails)
	mails.Post("/send", mailHandler.SendMail)
	mails.Get("/:id", mailHandler.GetMail)
	mails.Post("/:id/unread", mailHandler.MarkUnread)
}
