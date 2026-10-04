const { Router } = require("express");
const { z } = require("zod");
const { validateBody } = require("../middleware/validate");
const contactService = require("../services/contact.service");

const router = Router();

// ─── POST /api/contact (Public: submit contact form) ─────────────────
const contactSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().min(1).max(100),
  subject: z.string().min(1).max(255),
  message: z.string().min(1).max(65000),
});

router.post(
  "/",
  validateBody(contactSchema),
  async (req, res, next) => {
    try {
      const result = await contactService.submitContact(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
