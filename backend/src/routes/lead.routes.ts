import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody, validateParams } from "../middleware/validate";
import { authenticate, requireRole, optionalAuth } from "../middleware/auth";
import * as leadService from "../services/lead.service";
import { AppError } from "../middleware/errorHandler";

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
  async (req: Request, res: Response, next: NextFunction) => {
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

export default router;
