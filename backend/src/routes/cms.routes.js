const { Router } = require("express");
const { z } = require("zod");
const { validateBody, validateQuery } = require("../middleware/validate");
const { authenticate, requireRole } = require("../middleware/auth");
const { uploadAboutImage, uploadTeamImage } = require("../services/upload.service");
const aboutService = require("../services/about.service");
const teamService = require("../services/team.service");
const { AppError } = require("../middleware/errorHandler");

const router = Router();

// ══════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════

// ─── GET /api/about (Public: get about content) ──────────────────────
router.get(
  "/about",
  async (_req, res, next) => {
    try {
      const result = await aboutService.getAboutContent();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/team (Public: get team members) ────────────────────────
router.get(
  "/team",
  async (_req, res, next) => {
    try {
      const result = await teamService.getTeamMembers();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════════════
// ADMIN ROUTES (About)
// ══════════════════════════════════════════════════════════════════════

// ─── POST /api/admin/about (Create about content) ────────────────────
const aboutSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().min(1).max(65000),
});

router.post(
  "/admin/about",
  authenticate,
  requireRole("admin"),
  (req, res, next) => {
    uploadAboutImage(req, res, (err) => {
      if (err) return next(new AppError(err.message || "Upload failed", 400));
      next();
    });
  },
  async (req, res, next) => {
    try {
      const result = await aboutService.createAbout(
        { title: req.body.title, content: req.body.content },
        req.file
      );
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/about/:id (Update about content) ─────────────────
router.put(
  "/admin/about/:id",
  authenticate,
  requireRole("admin"),
  (req, res, next) => {
    uploadAboutImage(req, res, (err) => {
      if (err) return next(new AppError(err.message || "Upload failed", 400));
      next();
    });
  },
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError("Invalid ID", 400);
      const result = await aboutService.updateAbout(
        id,
        { title: req.body.title, content: req.body.content },
        req.file
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/about/:id ─────────────────────────────────────
router.delete(
  "/admin/about/:id",
  authenticate,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError("Invalid ID", 400);
      const result = await aboutService.deleteAbout(id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════════════
// ADMIN ROUTES (Team)
// ══════════════════════════════════════════════════════════════════════

// ─── POST /api/admin/team (Create team member) ───────────────────────
const teamSchema = z.object({
  fname: z.string().min(1).max(255),
  lname: z.string().min(1).max(255),
  email: z.string().email().max(255),
  wnumber: z.string().max(100).optional(),
  pnumber: z.string().max(100).optional(),
  about: z.string().min(1).max(65000),
  type: z.enum(["leader", "Team"]),
  fb: z.string().max(500).optional(),
  ig: z.string().max(500).optional(),
  linkdin: z.string().max(500).optional(),
  tiktok: z.string().max(500).optional(),
  twitter: z.string().max(500).optional(),
  position: z.string().min(1).max(255),
});

router.post(
  "/admin/team",
  authenticate,
  requireRole("admin"),
  (req, res, next) => {
    uploadTeamImage(req, res, (err) => {
      if (err) return next(new AppError(err.message || "Upload failed", 400));
      next();
    });
  },
  async (req, res, next) => {
    try {
      const result = await teamService.createTeamMember(req.body, req.file);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/team/:id (Update team member) ────────────────────
router.put(
  "/admin/team/:id",
  authenticate,
  requireRole("admin"),
  (req, res, next) => {
    uploadTeamImage(req, res, (err) => {
      if (err) return next(new AppError(err.message || "Upload failed", 400));
      next();
    });
  },
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError("Invalid ID", 400);
      const result = await teamService.updateTeamMember(id, req.body, req.file);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/team/:id ──────────────────────────────────────
router.delete(
  "/admin/team/:id",
  authenticate,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError("Invalid ID", 400);
      const result = await teamService.deleteTeamMember(id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
