package static

import (
	"embed"
	"path"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
)

//go:embed all:*
var staticFolder embed.FS

func SetupStatic(app fiber.Router) {
	app.Use(func(c *fiber.Ctx) error {
		if strings.HasPrefix(c.Path(), "/api") {
			return c.Next()
		}
		wantFile := path.Join("dist", c.Path())
		fallbackFile := path.Join("dist", "index.html")

		if wantFileBytes, err := staticFolder.ReadFile(wantFile); err == nil {
			c.Type(filepath.Ext(wantFile))
			return c.Send(wantFileBytes)
		}

		if fallbackFileBytes, err := staticFolder.ReadFile(fallbackFile); err == nil {
			c.Type(filepath.Ext(fallbackFile))
			return c.Send(fallbackFileBytes)
		}

		return c.Status(fiber.StatusNotFound).Send([]byte("No any static file found!"))
	})
}
