import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody, validateParams } from "../middleware/validate";
import { authenticate, requireRole } from "../middleware/auth";
import * as locationService from "../services/location.service";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// ══════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════

// ─── GET /api/cities ─────────────────────────────────────────────────
router.get(
  "/cities",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await locationService.getCities();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/states ─────────────────────────────────────────────────
router.get(
  "/states",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await locationService.getStates();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════════════
// ADMIN ROUTES (State)
// ══════════════════════════════════════════════════════════════════════

// ─── POST /api/admin/states ──────────────────────────────────────────
const stateSchema = z.object({ sname: z.string().min(1).max(255) });

router.post(
  "/admin/states",
  authenticate,
  requireRole("admin"),
  validateBody(stateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await locationService.createState({ sname: req.body.sname });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/states/:id ───────────────────────────────────────
const stateIdParam = z.object({ id: z.coerce.number().min(1) });

router.put(
  "/admin/states/:id",
  authenticate,
  requireRole("admin"),
  validateParams(stateIdParam),
  validateBody(stateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await locationService.updateState(Number(req.params.id), {
        sname: req.body.sname,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/states/:id ────────────────────────────────────
router.delete(
  "/admin/states/:id",
  authenticate,
  requireRole("admin"),
  validateParams(stateIdParam),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await locationService.deleteState(Number(req.params.id));
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════════════
// ADMIN ROUTES (City)
// ══════════════════════════════════════════════════════════════════════

const citySchema = z.object({
  cname: z.string().min(1).max(255),
  sid: z.coerce.number().min(1),
});

// ─── POST /api/admin/cities ──────────────────────────────────────────
router.post(
  "/admin/cities",
  authenticate,
  requireRole("admin"),
  validateBody(citySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await locationService.createCity({
        cname: req.body.cname,
        sid: req.body.sid,
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/cities/:id ───────────────────────────────────────
const cityIdParam = z.object({ id: z.coerce.number().min(1) });

router.put(
  "/admin/cities/:id",
  authenticate,
  requireRole("admin"),
  validateParams(cityIdParam),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await locationService.updateCity(Number(req.params.id), {
        cname: req.body.cname,
        sid: req.body.sid,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/cities/:id ────────────────────────────────────
router.delete(
  "/admin/cities/:id",
  authenticate,
  requireRole("admin"),
  validateParams(cityIdParam),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await locationService.deleteCity(Number(req.params.id));
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
