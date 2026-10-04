/**
 * The OTP email job.
 *
 * Why it exists: SMTP has a multi-second tail, and before M02 that tail was in
 * the user's critical path. A registration used to be gated on a full SMTP
 * round-trip, so a slow mail server was a slow website and a failed one was a
 * registration that returned 500 having stored nothing the user could use. The
 * queue takes SMTP off the request; the retry policy means a transient failure no
 * longer loses the mail.
 *
 * The processor **throws** on failure rather than returning a boolean, and that
 * is the load-bearing line: `email.service` catches its own send errors and
 * returns `false`, so a processor that returned that value would report success to
 * the queue, the job would be marked `completed`, and the OTP would never be
 * delivered — with the queue showing a clean run. Throwing is how "the mail did
 * not go out" becomes a retry and then a visible `failed` row.
 */
const config = require("../../../config");
const emailService = require("../../../services/email.service");

/**
 * @param {object} payload
 * @param {string} payload.to recipient
 * @param {string} payload.otp the code, as cached by `auth.service.storeOtp`
 * @param {"register" | "reset"} payload.purpose
 * @returns {Promise<{ to: string, purpose: string }>}
 * @throws when SMTP reports a failure, so the job retries
 */
async function processOtpEmail({ to, otp, purpose }) {
  if (!to || !otp) {
    // A payload this shape is a bug in the producer, not a transient failure.
    // Throwing anyway costs three attempts and then surfaces it as a failed row,
    // which is where it belongs — silently completing would drop a registration
    // email with no trace anywhere.
    throw new Error(`otp-email job is missing ${!to ? "to" : "otp"}`);
  }

  const sent =
    purpose === "reset"
      ? await emailService.sendPasswordResetEmail(to, otp)
      : await emailService.sendOtpEmail(to, otp);

  if (!sent) {
    throw new Error(`SMTP rejected the ${purpose || "register"} OTP email to ${to}`);
  }

  return { to, purpose: purpose || "register", site: config.mail.siteName };
}

module.exports = { processOtpEmail };