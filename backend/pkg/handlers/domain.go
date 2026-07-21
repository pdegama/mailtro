package handlers

import (
	"github.com/gofiber/fiber/v2"

	domainsvc "github.com/pdegama/mailtroapp/pkg/service/domain"
)

type DomainHandler struct {
	Service *domainsvc.Service
}

func NewDomainHandler(service *domainsvc.Service) *DomainHandler {
	return &DomainHandler{Service: service}
}

// ListDomains handles GET /api/domains — claims with their DNS records.
func (h *DomainHandler) ListDomains(c *fiber.Ctx) error {
	user := currentUser(c)
	domains, err := h.Service.List(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch domains"})
	}

	type item struct {
		Domain  interface{}           `json:"domain"`
		Records []domainsvc.DNSRecord `json:"records"`
	}
	out := make([]item, 0, len(domains))
	for i := range domains {
		out = append(out, item{Domain: domains[i], Records: h.Service.Records(&domains[i])})
	}
	return c.JSON(fiber.Map{"domains": out})
}

// AddDomain handles POST /api/domains {name}
func (h *DomainHandler) AddDomain(c *fiber.Ctx) error {
	user := currentUser(c)
	var req struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	d, err := h.Service.Add(user.ID, req.Name)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"domain": d, "records": h.Service.Records(d)})
}

// VerifyDomain handles POST /api/domains/:id/verify
func (h *DomainHandler) VerifyDomain(c *fiber.Ctx) error {
	user := currentUser(c)
	id, err := paramUint(c, "id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	d, err := h.Service.Verify(user.ID, id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"domain": d, "records": h.Service.Records(d)})
}

// DeleteDomain handles DELETE /api/domains/:id
func (h *DomainHandler) DeleteDomain(c *fiber.Ctx) error {
	user := currentUser(c)
	id, err := paramUint(c, "id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	if err := h.Service.Delete(user.ID, id); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

// ListAliases handles GET /api/domains/:id/aliases
func (h *DomainHandler) ListAliases(c *fiber.Ctx) error {
	user := currentUser(c)
	id, err := paramUint(c, "id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	aliases, err := h.Service.ListAliases(user.ID, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"aliases": aliases})
}

// AddAlias handles POST /api/domains/:id/aliases {name}
func (h *DomainHandler) AddAlias(c *fiber.Ctx) error {
	user := currentUser(c)
	id, err := paramUint(c, "id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	var req struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	alias, err := h.Service.AddAlias(user.ID, id, req.Name)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"alias": alias})
}

// DeleteAlias handles DELETE /api/domains/:id/aliases/:aliasId
func (h *DomainHandler) DeleteAlias(c *fiber.Ctx) error {
	user := currentUser(c)
	id, err := paramUint(c, "id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	aliasID, err := paramUint(c, "aliasId")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid alias id"})
	}
	if err := h.Service.DeleteAlias(user.ID, id, aliasID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
