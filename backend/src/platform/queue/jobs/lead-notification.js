/**
 * The admin lead/registration notification job.
 *
 * The admin inbox is told about a new registration or a new property enquiry
 * off the request path, for the same reason as the OTP email: SMTP latency is not
 * something a "I would like to view this property" form submission should be
 * waiting on, and the pre-M02 code did both — it awaited the send *and* scanned
 * the lead table synchronously inside the request.
 *
 * `lead.service.submitLead` commits the lead row **before** enqueueing, so a
 * worker that picks the job up immediately still sees the row.
 */
const config = require("../../../config");
const emailService = require("../../../services/email.service");

/**
 * @param {object} payload
 * @param {"lead" | "registration"} payload.kind
 * @param {string} payload.leadId the lead row's id, or the address for a registration
 * @param {string} payload.email the customer's address
 * @returns {Promise<{ to: string, kind: string, subject: string }>}
 * @throws when SMTP reports a failure, or when there is nowhere to send it
 */
async function processLeadNotification({ kind, leadId, email }) {
  // The admin mailbox is the SMTP account itself. There is no separate
  // "notification address" config key, and adding one here would mean a second
  // source of truth for a value that has never existed.
  const adminEmail = config.mail.user;

  if (!adminEmail) {
    // Not retryable: no number of attempts will produce SMTP_USER. Failing loudly
    // is the point — the alternative is a silent inbox that stopped being told
    // about leads, which is the failure mode M00.8 was about.
    throw new Error("SMTP_USER is not configured — lead notifications have nowhere to go");
  }

  if (!email) {
    throw new Error(`lead-notification job for ${kind || "lead"} ${leadId} has no customer email`);
  }

  const sent = await emailService.sendAdminNotificationEmail(adminEmail, email);
  if (!sent) {
    throw new Error(`SMTP rejected the ${kind} notification to ${adminEmail}`);
  }

  return { to: adminEmail, kind: kind || "lead", subject: String(leadId) };
}

module.exports = { processLeadNotification };