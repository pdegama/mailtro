package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/pdegama/mailtroapp/pkg/config"
	"github.com/pdegama/mailtroapp/pkg/db"
	"github.com/pdegama/mailtroapp/pkg/routers"
)

func main() {
	// Load Config
	cfg := config.Load()

	// Initialize Database
	database, err := db.Init(cfg)
	if err != nil {
		log.Printf("ERROR: Database initialization failed: %v\n", err)
		log.Println("Please verify your PostgreSQL credentials in the .env file or system environment variables.")
		log.Fatal("Exiting application...")
	}

	// Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName: "Mailtro API Backend v1.0",
	})

	// Middlewares
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Routes Setup
	routers.Setup(app, database)

	// Start Fiber App
	port := cfg.Port
	if port == "" {
		port = "3000"
	}

	log.Printf("Starting Fiber web server on port :%s...\n", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start web server: %v", err)
	}
}
