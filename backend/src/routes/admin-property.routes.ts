import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody, validateQuery, validateParams } from "../middleware/validate";
import { authenticate, requireRole } from "../middleware/auth";
import * as propertyService from "../services/property.service";
import * as leadService from "../services/lead.service";
import { AppError } from "../middleware/errorHandler";

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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await propertyService.adminListProperties(
        Number(req.query.page),
        Number(req.query.limit),
        {
          status: req.query.status as string | undefined,
          stype: req.query.stype as string | undefined,
          type: req.query.type as string | undefined,
          search: req.query.search as string | undefined,
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await leadService.listLeads(
        Number(req.query.page),
        Number(req.query.limit),
        { from: req.query.from as string, to: req.query.to as string }
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tsv = await leadService.exportLeads(
        req.query.mode as "all" | "page" | "range",
        Number(req.query.page),
        Number(req.query.limit),
        { from: req.query.from as string, to: req.query.to as string }
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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

export default router;
