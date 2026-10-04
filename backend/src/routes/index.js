const { Router } = require("express");
// M03: `/auth` is no longer mounted here. It is a module, and it is registered in
// `src/bootstrap/registerModules.js` — see the module manifest contract in
// `docs/architecture/module-contract.md`. The path is unchanged: `/api/auth`.
const userRoutes = require("./user.routes");
const adminRoutes = require("./admin.routes");
const propertyRoutes = require("./property.routes");
const leadRoutes = require("./lead.routes");
const feedbackRoutes = require("./feedback.routes");
const cmsRoutes = require("./cms.routes");
const locationRoutes = require("./location.routes");
const dashboardRoutes = require("./dashboard.routes");
const contactRoutes = require("./contact.routes");
const adminPropertyRoutes = require("./admin-property.routes");

const router = Router();

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

module.exports = router;
