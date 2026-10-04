const { Router } = require("express");
const { z } = require("zod");
const { validateQuery } = require("../middleware/validate");
const { authenticate, requireRole } = require("../middleware/auth");
const dashboardService = require("../services/dashboard.service");

const router = Router();

// All dashboard routes require admin auth
router.use(authenticate, requireRole("admin"));

// ─── GET /api/admin/dashboard/stats ──────────────────────────────────
router.get(
  "/stats",
  async (_req, res, next) => {
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
  async (req, res, next) => {
    try {
      const result = await dashboardService.getChartData(
        req.user.email,
        req.query.status
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
  async (_req, res, next) => {
    try {
      const result = await dashboardService.getSidebarCounts();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
