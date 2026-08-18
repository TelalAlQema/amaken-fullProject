import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { uploadProfileImage, uploadLogo } from "../services/upload.service";
import * as userService from "../services/user.service";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── GET /api/users/me ──────────────────────────────────────────────
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.getProfile(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/users/me ──────────────────────────────────────────────
const updateProfileSchema = z.object({
  uname: z.string().min(1).max(100).optional(),
  lname: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  company: z.string().max(100).optional(),
  companyAddress: z.string().max(200).optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.string().optional(),
  wphone: z.string().max(20).optional(),
  utype: z.enum(["User", "Agent", "Builder"]).optional(),
});

router.put(
  "/me",
  validateBody(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await userService.updateProfile(req.user!.id, req.body);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/users/me/avatar ──────────────────────────────────────
router.post(
  "/me/avatar",
  (req: Request, res: Response, next: NextFunction) => {
    uploadProfileImage(req, res, (err) => {
      if (err) {
        return next(new AppError(err.message || "Upload failed", 400));
      }
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("No image file provided", 400);
      }
      const result = await userService.uploadProfileImage(req.user!.id, req.file);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/users/me/avatar ────────────────────────────────────
router.delete(
  "/me/avatar",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.removeProfileImage(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/users/me/logo ────────────────────────────────────────
router.post(
  "/me/logo",
  (req: Request, res: Response, next: NextFunction) => {
    uploadLogo(req, res, (err) => {
      if (err) {
        return next(new AppError(err.message || "Upload failed", 400));
      }
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("No logo file provided", 400);
      }
      const result = await userService.uploadCompanyLogo(req.user!.id, req.file);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/users/me/logo ──────────────────────────────────────
router.delete(
  "/me/logo",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.removeCompanyLogo(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/users/me/password ─────────────────────────────────────
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "Password must be 8-16 characters")
    .max(16, "Password must be 8-16 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/\d/, "Must contain a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special character"),
});

router.put(
  "/me/password",
  validateBody(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(
        req.user!.id,
        currentPassword,
        newPassword
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/users/me/links ────────────────────────────────────────
const socialLinksSchema = z.object({
  fb: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

router.put(
  "/me/links",
  validateBody(socialLinksSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.updateSocialLinks(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/users/me/deactivate ──────────────────────────────────
router.post(
  "/me/deactivate",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.deactivateAccount(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/users/me/activate ────────────────────────────────────
router.post(
  "/me/activate",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.activateAccount(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/users/me ───────────────────────────────────────────
router.delete(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.deleteAccount(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/users/block/:id ──────────────────────────────────────
router.post(
  "/block/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = parseInt(req.params.id);
      if (isNaN(targetId)) throw new AppError("Invalid user ID", 400);
      const result = await userService.blockSelf(targetId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/users/unblock/:id ────────────────────────────────────
router.post(
  "/unblock/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = parseInt(req.params.id);
      if (isNaN(targetId)) throw new AppError("Invalid user ID", 400);
      const result = await userService.unblockSelf(targetId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/users/:id (public profile) ────────────────────────────
router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = parseInt(req.params.id);
      if (isNaN(targetId)) throw new AppError("Invalid user ID", 400);
      const profile = await userService.getPublicProfile(targetId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
