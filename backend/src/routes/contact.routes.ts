import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import * as contactService from "../services/contact.service";

const router = Router();

// ─── POST /api/contact (Public: submit contact form) ─────────────────
const contactSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().min(1).max(100),
  subject: z.string().min(1).max(255),
  message: z.string().min(1).max(65000),
});

router.post(
  "/",
  validateBody(contactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await contactService.submitContact(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
