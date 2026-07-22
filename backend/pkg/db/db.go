package db

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/pdegama/mailtroapp/pkg/config"
	"github.com/pdegama/mailtroapp/pkg/models"
)

func Init(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		cfg.DBHost,
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBName,
		cfg.DBPort,
		cfg.DBSSLMode,
	)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection successfully established")

	// Run AutoMigrations
	// migrate(database)

	return database, nil
}

func migrate(database *gorm.DB) {
	err := database.AutoMigrate(
		&models.Users{},
		&models.Domain{},
		&models.Alias{},
		&models.Mail{},
	)
	if err != nil {
		log.Panicf("failed to run database migration: %w", err)
	}

	log.Println("Database migration completed successfully")
}
