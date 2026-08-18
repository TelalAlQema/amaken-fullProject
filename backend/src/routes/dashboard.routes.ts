import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateQuery } from "../middleware/validate";
import { authenticate, requireRole } from "../middleware/auth";
import * as dashboardService from "../services/dashboard.service";

const router = Router();

// All dashboard routes require admin auth
router.use(authenticate, requireRole("admin"));

// ─── GET /api/admin/dashboard/stats ──────────────────────────────────
router.get(
  "/stats",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await dashboardService.getDashboardStats();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/admin/dashboard/charts ─────────────────────────────────
const chartQuery = z.object({
  status: z.enum(["available", "sold_out"]).optional(),
});

router.get(
  "/charts",
  validateQuery(chartQuery),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await dashboardService.getChartData(
        req.user!.email,
        req.query.status as string | undefined
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/admin/dashboard/sidebar-counts ─────────────────────────
router.get(
  "/sidebar-counts",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await dashboardService.getSidebarCounts();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
