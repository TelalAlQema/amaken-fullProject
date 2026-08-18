import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import * as authService from "../services/auth.service";

const router = Router();

// ─── POST /api/auth/register ────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email(),
  uname: z.string().min(1).max(100),
  lname: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  password: z
    .string()
    .min(8, "Password must be 8-16 characters")
    .max(16, "Password must be 8-16 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/\d/, "Must contain a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special character"),
  utype: z.enum(["User", "Agent", "Builder"]),
  dateOfBirth: z.string().optional(),
  Address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  company: z.string().optional(),
  companyAddress: z.string().optional(),
  wphone: z.string().optional(),
  fb: z.string().optional(),
  linkedin: z.string().optional(),
  tiktok: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
});

router.post(
  "/register",
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.completeRegistration(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/login ───────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/verify-email ────────────────────────────────────
const verifyEmailSchema = z.object({
  email: z.string().email(),
});

router.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await authService.sendVerificationOtp(email);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/verify-otp ──────────────────────────────────────
const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

router.post(
  "/verify-otp",
  validateBody(verifyOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      const result = authService.verifyRegistrationOtp(email, code);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/forgot-password ─────────────────────────────────
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await authService.sendForgotPasswordOtp(email);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/verify-forgot-otp ───────────────────────────────
const verifyForgotOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

router.post(
  "/verify-forgot-otp",
  validateBody(verifyForgotOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      const result = authService.verifyForgotPasswordOtp(email, code);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/reset-password ──────────────────────────────────
const resetPasswordSchema = z.object({
  email: z.string().email(),
  resetToken: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be 8-16 characters")
    .max(16, "Password must be 8-16 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/\d/, "Must contain a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special character"),
});

router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, resetToken, password } = req.body;
      const result = await authService.resetPassword(email, resetToken, password);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/refresh ─────────────────────────────────────────
const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post(
  "/refresh",
  validateBody(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/logout ──────────────────────────────────────────
router.post("/logout", (_req: Request, res: Response) => {
  const result = authService.logout();
  res.json({ success: true, data: result });
});

export default router;
