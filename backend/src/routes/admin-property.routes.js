const { Router } = require("express");
const { z } = require("zod");
const { validateBody, validateQuery, validateParams } = require("../middleware/validate");
const { authenticate, requireRole } = require("../middleware/auth");
const propertyService = require("../services/property.service");
const leadService = require("../services/lead.service");
const { AppError } = require("../middleware/errorHandler");

const router = Router();

// All admin routes require admin auth
router.use(authenticate, requireRole("admin"));

// ─── GET /api/admin/properties ───────────────────────────────────────
const adminListQuery = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  status: z.string().optional(),
  stype: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
});

router.get(
  "/properties",
  validateQuery(adminListQuery),
  async (req, res, next) => {
    try {
      const result = await propertyService.adminListProperties(
        Number(req.query.page),
        Number(req.query.limit),
        {
          status: req.query.status,
          stype: req.query.stype,
          type: req.query.type,
          search: req.query.search,
        }
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/admin/properties/approval (pending approval) ───────────
router.get(
  "/properties/approval",
  validateQuery(adminListQuery),
  async (req, res, next) => {
    try {
      const result = await propertyService.adminListPendingApproval(
        Number(req.query.page),
        Number(req.query.limit)
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/properties/:id/approve ───────────────────────────
const propertyIdParam = z.object({ id: z.coerce.number().min(1) });

router.put(
  "/properties/:id/approve",
  validateParams(propertyIdParam),
  async (req, res, next) => {
    try {
      const result = await propertyService.approveProperty(Number(req.params.id));
      res.json({ success: true, data: result, message: "Property approved" });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/properties/:id/disapprove ────────────────────────
router.put(
  "/properties/:id/disapprove",
  validateParams(propertyIdParam),
  async (req, res, next) => {
    try {
      const result = await propertyService.disapproveProperty(Number(req.params.id));
      res.json({ success: true, data: result, message: "Property disapproved" });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/properties/:id/hide (adminapproval=0) ───────────
router.put(
  "/properties/:id/hide",
  validateParams(propertyIdParam),
  async (req, res, next) => {
    try {
      const result = await propertyService.hideProperty(Number(req.params.id));
      res.json({ success: true, data: result, message: "Property hidden" });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/properties/:id/display (adminapproval=1) ─────────
router.put(
  "/properties/:id/display",
  validateParams(propertyIdParam),
  async (req, res, next) => {
    try {
      const result = await propertyService.displayProperty(Number(req.params.id));
      res.json({ success: true, data: result, message: "Property displayed" });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/properties/:id/freeze ────────────────────────────
router.put(
  "/properties/:id/freeze",
  validateParams(propertyIdParam),
  async (req, res, next) => {
    try {
      const result = await propertyService.freezeProperty(Number(req.params.id));
      res.json({ success: true, data: result, message: "Property frozen" });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/properties/:id/release ───────────────────────────
router.put(
  "/properties/:id/release",
  validateParams(propertyIdParam),
  async (req, res, next) => {
    try {
      const result = await propertyService.releaseProperty(Number(req.params.id));
      res.json({ success: true, data: result, message: "Property released" });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/properties/:id ────────────────────────────────
router.delete(
  "/properties/:id",
  validateParams(propertyIdParam),
  async (req, res, next) => {
    try {
      const result = await propertyService.deleteProperty(Number(req.params.id));
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/admin/leads ────────────────────────────────────────────
const leadsQuery = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  from: z.string().optional(),
  to: z.string().optional(),
});

router.get(
  "/leads",
  validateQuery(leadsQuery),
  async (req, res, next) => {
    try {
      const result = await leadService.listLeads(
        Number(req.query.page),
        Number(req.query.limit),
        { from: req.query.from, to: req.query.to }
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/admin/leads/export ─────────────────────────────────────
const exportQuery = z.object({
  mode: z.enum(["all", "page", "range"]).optional().default("all"),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  from: z.string().optional(),
  to: z.string().optional(),
});

router.get(
  "/leads/export",
  validateQuery(exportQuery),
  async (req, res, next) => {
    try {
      const tsv = await leadService.exportLeads(
        req.query.mode,
        Number(req.query.page),
        Number(req.query.limit),
        { from: req.query.from, to: req.query.to }
      );

      res.setHeader("Content-Type", "application/vnd.ms-excel; charset=UTF-8");
      res.setHeader("Content-Disposition", "attachment; filename=property_leads.xls");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.send("\xEF\xBB\xBF" + tsv);
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/leads/:id ─────────────────────────────────────
router.delete(
  "/leads/:id",
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError("Invalid lead ID", 400);
      const result = await leadService.deleteLead(id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/admin/leads/bulk-delete ───────────────────────────────
const bulkDeleteSchema = z.object({
  ids: z.array(z.coerce.number()).min(1),
});

router.post(
  "/leads/bulk-delete",
  validateBody(bulkDeleteSchema),
  async (req, res, next) => {
    try {
      const result = await leadService.bulkDeleteLeads(req.body.ids);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/admin/leads/delete-all ────────────────────────────────
router.post(
  "/leads/delete-all",
  async (req, res, next) => {
    try {
      const result = await leadService.deleteAllLeads();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/admin/contacts ─────────────────────────────────────────
router.get(
  "/contacts",
  validateQuery(adminListQuery),
  async (req, res, next) => {
    try {
      const { listContacts } = await import("../services/contact.service");
      const contacts = await listContacts(
        Number(req.query.page),
        Number(req.query.limit)
      );
      res.json({ success: true, data: contacts });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/contacts/:id ──────────────────────────────────
router.delete(
  "/contacts/:id",
  async (req, res, next) => {
    try {
      const { deleteContact } = await import("../services/contact.service");
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new AppError("Invalid contact ID", 400);
      const result = await deleteContact(id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
