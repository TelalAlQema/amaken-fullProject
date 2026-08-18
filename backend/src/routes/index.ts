import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";
import propertyRoutes from "./property.routes";
import leadRoutes from "./lead.routes";
import feedbackRoutes from "./feedback.routes";
import cmsRoutes from "./cms.routes";
import locationRoutes from "./location.routes";
import dashboardRoutes from "./dashboard.routes";
import contactRoutes from "./contact.routes";
import adminPropertyRoutes from "./admin-property.routes";

const router = Router();

// Auth
router.use("/auth", authRoutes);

// Users
router.use("/users", userRoutes);

// Public properties (filtered listing, detail, by state)
router.use("/properties", propertyRoutes);

// Property leads (public submission)
router.use("/properties", leadRoutes);

// Public CMS (about, team) - mounted at root so /api/about, /api/team work
// Admin CMS routes inside also have /admin/ prefix so they resolve at /api/admin/about, /api/admin/team
router.use(cmsRoutes);

// Public locations (also has /admin/ prefixed routes for city/state CRUD)
router.use(locationRoutes);

// Contact form (public)
router.use("/contact", contactRoutes);

// Feedback (authenticated user routes)
router.use("/feedback", feedbackRoutes);

// Admin routes
router.use("/admin", adminRoutes);
router.use("/admin", adminPropertyRoutes);
router.use("/admin", dashboardRoutes);

export default router;
