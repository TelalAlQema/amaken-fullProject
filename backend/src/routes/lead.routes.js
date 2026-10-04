const { Router } = require("express");
const { z } = require("zod");
const { validateBody, validateParams } = require("../middleware/validate");
const { authenticate, requireRole, optionalAuth } = require("../middleware/auth");
const leadService = require("../services/lead.service");
const { AppError } = require("../middleware/errorHandler");

const router = Router();

// ─── POST /api/properties/:id/lead (Submit lead for a property) ──────
const leadSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().min(1).max(100),
  nationality: z.string().max(100).optional(),
});

const leadIdParam = z.object({ id: z.coerce.number().min(1) });

router.post(
  "/:id/lead",
  validateParams(leadIdParam),
  validateBody(leadSchema),
  async (req, res, next) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "";
      const device = req.headers["user-agent"] || "";
      const lead = await leadService.submitLead(
        Number(req.params.id),
        req.body,
        ip,
        device
      );
      res.status(201).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
