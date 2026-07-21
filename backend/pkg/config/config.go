package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string
	Port       string

	JWTSecret string

	// AMQP / box queues
	AMQPHost     string
	AMQPPort     string
	AMQPUser     string
	AMQPPassword string

	QueueReceiver string // box server puts incoming mail here
	QueueSender   string // we put outgoing mail here, box client picks it up
	QueueStatus   string // box client puts delivery status here

	// DNS / mail platform identity
	MXHosts      []string // records users must add, e.g. smtp.mailtro.site; separated by ';'
	SPFInclude   string   // root spf include, e.g. _spf.mailtro.site
	VerifyZone   string   // cname target zone for domain ownership, e.g. verify.mailtro.site
	MailHostname string   // primary mail server hostname

	// Delivery retry
	RetryDelayMinutes int
	MaxRetries        int
}

func Load() *Config {
	// Attempt to load .env file if it exists, but don't error out since environment variables
	// might be injected directly in production environments.
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	return &Config{
		DBHost:     GetEnv("DB_HOST", "localhost"),
		DBPort:     GetEnv("DB_PORT", "5432"),
		DBUser:     GetEnv("DB_USER", "postgres"),
		DBPassword: GetEnv("DB_PASSWORD", "postgres"),
		DBName:     GetEnv("DB_NAME", "mailtro"),
		DBSSLMode:  GetEnv("DB_SSLMODE", "disable"),
		Port:       GetEnv("PORT", "3000"),

		JWTSecret: GetEnv("JWT_SECRET", "supersecret"),

		AMQPHost:     GetEnv("AMQP_HOST", "localhost"),
		AMQPPort:     GetEnv("AMQP_PORT", "5672"),
		AMQPUser:     GetEnv("AMQP_USER", "mailtro"),
		AMQPPassword: GetEnv("AMQP_PASSWORD", "mailtro"),

		QueueReceiver: GetEnv("QUEUE_RECEIVER", "box-receiver-1"),
		QueueSender:   GetEnv("QUEUE_SENDER", "box-sender-1"),
		QueueStatus:   GetEnv("QUEUE_STATUS", "box-status-1"),

		MXHosts:      splitList(GetEnv("MX_HOSTS", "smtp.mailtro.site")),
		SPFInclude:   GetEnv("SPF_INCLUDE", "_spf.mailtro.site"),
		VerifyZone:   GetEnv("VERIFY_ZONE", "verify.mailtro.site"),
		MailHostname: GetEnv("MAIL_HOSTNAME", "smtp.mailtro.site"),

		RetryDelayMinutes: getEnvInt("RETRY_DELAY_MINUTES", 6),
		MaxRetries:        getEnvInt("MAX_RETRIES", 5),
	}
}

func GetEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		if n, err := strconv.Atoi(strings.TrimSpace(value)); err == nil {
			return n
		}
	}
	return fallback
}

// splitList splits env list values separated by ';' (MX_HOSTS=mx1.tld;mx2.tld)
func splitList(value string) []string {
	parts := strings.Split(value, ";")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
