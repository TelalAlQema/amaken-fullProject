import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody, validateQuery } from "../middleware/validate";
import { authenticate, requireRole } from "../middleware/auth";
import { uploadProfileImage, uploadLogo } from "../services/upload.service";
import * as adminService from "../services/admin.service";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// ─── POST /api/admin/pin ────────────────────────────────────────────
const pinSchema = z.object({ pin: z.string().min(1) });

router.post(
  "/pin",
  validateBody(pinSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pin } = req.body;
      const result = await adminService.verifyAdminPin(pin);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/admin/login ──────────────────────────────────────────
const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  "/login",
  validateBody(adminLoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await adminService.adminLogin(email, password);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// All routes below require admin auth
router.use(authenticate, requireRole("admin"));

// ─── GET /api/admin/profile ─────────────────────────────────────────
router.get(
  "/profile",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await adminService.getAdminProfile(req.user!.id);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/profile ─────────────────────────────────────────
const updateAdminProfileSchema = z.object({
  aname: z.string().max(100).optional(),
  alname: z.string().max(100).optional(),
  aphone: z.string().max(20).optional(),
  agency: z.string().max(100).optional(),
  astate: z.string().optional(),
  acity: z.string().optional(),
  agender: z.enum(["Male", "Female", "Other"]).optional(),
  adateofbirth: z.string().optional(),
  aAddress: z.string().max(200).optional(),
  awphone: z.string().max(20).optional(),
  website: z.string().optional(),
  afb: z.string().optional(),
  ainstagram: z.string().optional(),
  atwitter: z.string().optional(),
  atiktok: z.string().optional(),
  alinkedin: z.string().optional(),
});

router.put(
  "/profile",
  validateBody(updateAdminProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await adminService.updateAdminProfile(req.user!.id, req.body);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/admin/profile/avatar ─────────────────────────────────
router.post(
  "/profile/avatar",
  (req: Request, res: Response, next: NextFunction) => {
    uploadProfileImage(req, res, (err) => {
      if (err) return next(new AppError(err.message || "Upload failed", 400));
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new AppError("No image file provided", 400);
      const result = await adminService.uploadAdminImage(req.user!.id, req.file);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/profile/avatar ───────────────────────────────
router.delete(
  "/profile/avatar",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.removeAdminImage(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/admin/profile/logo ───────────────────────────────────
router.post(
  "/profile/logo",
  (req: Request, res: Response, next: NextFunction) => {
    uploadLogo(req, res, (err) => {
      if (err) return next(new AppError(err.message || "Upload failed", 400));
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw new AppError("No logo file provided", 400);
      const result = await adminService.uploadAdminLogo(req.user!.id, req.file);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/profile/logo ─────────────────────────────────
router.delete(
  "/profile/logo",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.removeAdminLogo(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/profile/links ───────────────────────────────────
const adminLinksSchema = z.object({
  website: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
});

router.put(
  "/profile/links",
  validateBody(adminLinksSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.updateAdminSocialLinks(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/profile/password ────────────────────────────────
const adminPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "Password must be 8-16 characters")
    .max(16)
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/\d/, "Must contain a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special character"),
});

router.put(
  "/profile/password",
  validateBody(adminPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await adminService.changeAdminPassword(
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

// ─── Admin User Management ──────────────────────────────────────────

// GET /api/admin/users?type=User|Agent|Builder&page=1&limit=50
const listUsersQuerySchema = z.object({
  type: z.enum(["User", "Agent", "Builder"]).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

router.get(
  "/users",
  validateQuery(listUsersQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.listUsers(
        req.query.type as any,
        Number(req.query.page),
        Number(req.query.limit)
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/users/agents
router.get(
  "/users/agents",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const result = await adminService.listUsers("Agent", page, limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/users/builders
router.get(
  "/users/builders",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const result = await adminService.listUsers("Builder", page, limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/users/admins
router.get(
  "/users/admins",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.listAdmins();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/admin/users/:id/status  (activate/deactivate/freeze/unfreeze)
const statusSchema = z.object({
  action: z.enum(["activate", "deactivate", "freeze", "unfreeze"]),
});

router.put(
  "/users/:id/status",
  validateBody(statusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) throw new AppError("Invalid user ID", 400);

      const { action } = req.body;
      let result;
      switch (action) {
        case "activate":
          result = await adminService.adminActivateUser(userId);
          break;
        case "deactivate":
          result = await adminService.adminDeactivateUser(userId);
          break;
        case "freeze":
          result = await adminService.adminFreezeUser(userId);
          break;
        case "unfreeze":
          result = await adminService.adminUnfreezeUser(userId);
          break;
      }

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/admin/users/:id
router.delete(
  "/users/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) throw new AppError("Invalid user ID", 400);
      const result = await adminService.adminDeleteUser(userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Account Lists ──────────────────────────────────────────────────

const paginationQuery = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

// GET /api/admin/accounts/registered
router.get(
  "/accounts/registered",
  validateQuery(paginationQuery),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.listRegisteredAccounts(
        Number(req.query.page),
        Number(req.query.limit)
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/accounts/deleted
router.get(
  "/accounts/deleted",
  validateQuery(paginationQuery),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.listDeletedAccounts(
        Number(req.query.page),
        Number(req.query.limit)
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/accounts/blocked
router.get(
  "/accounts/blocked",
  validateQuery(paginationQuery),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.listBlockedAccounts(
        Number(req.query.page),
        Number(req.query.limit)
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/admin/accounts/:id
router.delete(
  "/accounts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError("Invalid record ID", 400);
      const result = await adminService.deleteAccountRecord(id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
