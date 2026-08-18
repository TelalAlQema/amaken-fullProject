import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody, validateParams } from "../middleware/validate";
import { authenticate, requireRole } from "../middleware/auth";
import * as feedbackService from "../services/feedback.service";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// ─── POST /api/feedback (Create feedback) ────────────────────────────
const createFeedbackSchema = z.object({
  receiverEmail: z.string().email(),
  description: z.string().min(1).max(65000),
  rating: z.number().min(0).max(5).optional(),
});

router.post(
  "/",
  authenticate,
  requireRole("user"),
  validateBody(createFeedbackSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await feedbackService.createFeedback(
        req.user!.email,
        req.body.receiverEmail,
        { description: req.body.description, rating: req.body.rating }
      );
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/feedback/my (My feedback - sent by me) ─────────────────
router.get(
  "/my",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const result = await feedbackService.getMyFeedback(req.user!.id, page, limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/feedback/about-me (Feedback about me) ──────────────────
router.get(
  "/about-me",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const result = await feedbackService.getFeedbackAboutMe(req.user!.email, page, limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/feedback/:id (Get single feedback) ────────────────────
const fidParam = z.object({ id: z.coerce.number().min(1) });

router.get(
  "/:id",
  validateParams(fidParam),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await feedbackService.getFeedbackById(Number(req.params.id));
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/feedback/:id (Update feedback) ─────────────────────────
const updateFeedbackSchema = z.object({
  description: z.string().min(1).max(65000).optional(),
  rating: z.number().min(0).max(5).optional(),
});

router.put(
  "/:id",
  authenticate,
  requireRole("user"),
  validateParams(fidParam),
  validateBody(updateFeedbackSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await feedbackService.updateFeedback(
        Number(req.params.id),
        req.user!.id,
        req.body
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/feedback/:id (Delete feedback) ──────────────────────
router.delete(
  "/:id",
  authenticate,
  validateParams(fidParam),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await feedbackService.deleteFeedback(
        Number(req.params.id),
        req.user!.id
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
