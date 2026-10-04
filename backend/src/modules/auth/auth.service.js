/**
 * Auth domain logic.
 *
 * Replaces `src/services/auth.service.js` (deleted in M03). What changed and why,
 * beyond the move:
 *
 *   - **Refresh rotation**, with the whole family revoked on reuse. See
 *     `token.service.js`; this file owns the part that needs the database.
 *   - **`tokenVersion` is finally read.** It rode in every token as `undefined`
 *     because no column existed. It is now compared against the row on refresh and
 *     bumped by a password reset, so "I reset my password" actually ends the
 *     attacker's session instead of leaving it alive for seven days.
 *   - **Registration is transactional.** The user row and its `register_email`
 *     ledger row were independent writes.
 *   - **One password implementation.** The SHA-256 fallback and the bcrypt upgrade
 *     are one function here, not two blocks inline. The admin path still has its
 *     own copy, with SHA-1; M04 collapses the pair onto one `password.service`.
 *   - **`verifyAccessToken` returning `null` for everything** is gone. Every failure
 *     now carries a reason, and the 401s say different things.
 *
 * It never sees `req` or `res`, and it never imports Prisma.
 */
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

const cache = require("../../platform/cache");
const queue = require("../../platform/queue");
const { AppError } = require("../../core/errors");

const repository = require("./auth.repository");
const mapper = require("./auth.mapper");
const policy = require("./auth.policy");
const tokens = require("./token.service");

/**
 * OTP storage.
 *
 * **M02 moved this off `Map` and onto the cache.** The `Map` was per-process, so
 * under two replicas an OTP issued by A could not be verified by B — roughly half
 * of all registrations failed with `OTP_INVALID` depending on which replica the
 * load balancer picked.
 *
 * `platform/cache` writes this namespace to the **durable tier** — MySQL, via
 * `kv_entries` — so the code is visible to every replica immediately after it is
 * issued. That is a deliberate choice over a normal cache namespace: an in-process
 * L1 in front of it would make an OTP issued by A invisible to B for as long as A's
 * entry lived, which is the original bug with a shorter fuse.
 *
 * **Required for correctness, not for caching**: a miss and an outage are
 * indistinguishable to `verifyOtp`, which is precisely why a single-replica
 * deployment must not silently depend on it. Namespaced under `otp:` so
 * `invalidatePrefix` for anything else cannot clear a live code.
 */
const OTP_NAMESPACE = "otp";
const OTP_TTL_SECONDS = 600;
/** Reset tokens live 15 minutes, not the OTP's 10. */
const RESET_TOKEN_TTL_SECONDS = 900;

/** The only password hash this module writes. */
const BCRYPT_COST = 12;

/** @param {string} purpose */
const OTP_PURPOSE = Object.freeze({
  REGISTER: "register",
  FORGOT_PASSWORD: "forgot_password",
});

/** Keyed by email *and* purpose: a reset code must never satisfy a login OTP. */
function otpKey(email, purpose) {
  return `${email.toLowerCase()}:${purpose}`;
}

function resetTokenKey(email) {
  return `reset:${email.toLowerCase()}`;
}

/** @returns {string} six digits, and always six. */
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Issues an OTP and stores it with a TTL.
 *
 * Single-use is enforced by the TTL and by `verifyOtp`'s delete, not by an
 * in-process expiry field.
 *
 * @param {string} email
 * @param {string} purpose
 * @param {number} [ttlSeconds]
 * @returns {Promise<string>} the code, for handing to the queue.
 */
async function storeOtp(email, purpose, ttlSeconds = OTP_TTL_SECONDS) {
  const code = generateOtp();
  await cache.set(OTP_NAMESPACE, otpKey(email, purpose), { code, purpose }, ttlSeconds);
  return code;
}

/**
 * Consumes an OTP. Single-use: the key is deleted before the comparison is
 * reported, so a replay of a valid code fails.
 *
 * `timingSafeEqual` requires two buffers of **equal length** and throws
 * otherwise — which would turn "wrong-length input" into a 500. The length check
 * below is what keeps a malformed `code` a `false`, and it is checked before the
 * comparison for that reason, not because the leak is interesting.
 *
 * @param {string} email
 * @param {string} code
 * @param {string} purpose
 * @returns {Promise<boolean>}
 */
async function verifyOtp(email, code, purpose) {
  const key = otpKey(email, purpose);
  const stored = await cache.get(OTP_NAMESPACE, key);

  // Deleted unconditionally: whether the code matches, the attempt is spent. An
  // attacker must not be able to guess by keeping an entry alive.
  await cache.del(OTP_NAMESPACE, key);

  if (!stored || stored.purpose !== purpose) return false;
  if (typeof code !== "string" || code.length !== stored.code.length) return false;
  return crypto.timingSafeEqual(Buffer.from(stored.code), Buffer.from(code));
}

// ─── passwords ──────────────────────────────────────────────────────────────

/**
 * The single password implementation for the user path.
 *
 * Three accepted shapes, in order:
 *   1. bcrypt / argon2 by prefix — the normal case;
 *   2. a bare digest with no prefix — **SHA-256 hex**, written by the PHP
 *      application this API replaced. Compared in constant time, which the original
 *      `sha256 === stored` was not, and upgraded in place on a successful match so
 *      the fallback is a migration rather than a permanent branch.
 *
 * The admin path has a second, different fallback (SHA-1) inline in
 * `admin.service.js:67`. That is the divergence M04 removes by promoting this
 * function to a shared `password.service`; it is left alone here because changing
 * the admin login in the auth milestone is how a reviewer stops reading the diff.
 *
 * @param {string} plain
 * @param {string} stored
 * @returns {Promise<{ ok: boolean, upgrade: string|null }>} `upgrade` is a
 *   cost-12 hash to persist when the stored value was weaker or cost too little.
 */
async function verifyPassword(plain, stored) {
  if (typeof stored !== "string" || stored.length === 0) return { ok: false, upgrade: null };

  if (stored.startsWith("$2") || stored.startsWith("$argon")) {
    const ok = await bcrypt.compare(plain, stored);
    if (!ok) return { ok: false, upgrade: null };

    // Upgrade cost if needed. `getRounds` throws on a non-bcrypt string, which is
    // why it is only reached once the prefix has already proved the format.
    if (stored.startsWith("$2") && bcrypt.getRounds(stored) < BCRYPT_COST) {
      return { ok: true, upgrade: await hashPassword(plain) };
    }

    return { ok: true, upgrade: null };
  }

  const legacy = crypto.createHash("sha256").update(plain).digest("hex");
  const expected = Buffer.from(stored);
  const actual = Buffer.from(legacy);

  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return { ok: false, upgrade: null };
  }

  return { ok: true, upgrade: await hashPassword(plain) };
}

/**
 * @param {string} plain
 * @returns {Promise<string>}
 */
function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/**
 * Everything the service needs to know about an address before touching it.
 *
 * The blocked check reads the delete ledger; the "already exists" checks are what
 * turn a duplicate registration into a 409 instead of a unique-constraint 500.
 *
 * @param {string} email already normalised
 * @returns {Promise<{ deleted: boolean, blocked: boolean }>}
 */
async function accountRestrictions(email) {
  // Cross-module read of `del_account`; see auth.repository.js.
  const deleted = await repository.findDeletedAccountByEmail(email);
  return { deleted: Boolean(deleted), blocked: false };
}

/**
 * `POST /verify-email` — step one of registration.
 *
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
async function sendVerificationOtp(email) {
  const normalizedEmail = normalizeEmail(email);

  policy.assertNotBlocked(await accountRestrictions(normalizedEmail), {
    message: "This email has been blocked",
    code: "EMAIL_BLOCKED",
  });

  // Cross-module read of `register_email`; see auth.repository.js.
  const existingRegistration = await repository.findRegisterEmailByEmail(normalizedEmail);
  if (existingRegistration) {
    throw new AppError(
      `Email already has a ${existingRegistration.utype}-${existingRegistration.type} account`,
      409,
      "EMAIL_EXISTS"
    );
  }

  if (await repository.findUserByEmail(normalizedEmail)) {
    throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
  }

  const otp = await storeOtp(normalizedEmail, OTP_PURPOSE.REGISTER);

  // Queued, not awaited inline. SMTP has a multi-second tail and it has no business
  // in a user-facing registration; the job retries, so a transient SMTP failure no
  // longer loses the mail. Fail-open on enqueue — see platform/queue/index.js — so a
  // database blip degrades to "the email is late", not "registration is down".
  await queue.enqueueOtpEmail({ to: normalizedEmail, otp, purpose: "register" });

  // Also notify admin, queued so SMTP concurrency stays bounded and the second
  // round-trip leaves the request path.
  await queue.enqueueLeadNotification({
    kind: "registration",
    leadId: normalizedEmail,
    email: normalizedEmail,
  });

  return { message: "Verification code sent to your email" };
}

/**
 * `POST /verify-otp` — step two of registration.
 *
 * @param {string} email
 * @param {string} code
 * @returns {Promise<{ message: string, email: string }>}
 */
async function verifyRegistrationOtp(email, code) {
  const normalizedEmail = normalizeEmail(email);
  const valid = await verifyOtp(normalizedEmail, code, OTP_PURPOSE.REGISTER);

  if (!valid) {
    throw new AppError("Invalid or expired verification code", 400, "OTP_INVALID");
  }

  return { message: "Email verified successfully", email: normalizedEmail };
}

/**
 * `POST /register`.
 *
 * @param {object} data a parsed `registerSchema`
 * @returns {Promise<object>} the session: `{ user, accessToken, refreshToken }`
 */
async function completeRegistration(data) {
  const normalizedEmail = normalizeEmail(data.email);

  policy.assertNotBlocked(await accountRestrictions(normalizedEmail), {
    message: "This email has been blocked",
    code: "EMAIL_BLOCKED",
  });

  if (await repository.findUserByEmail(normalizedEmail)) {
    throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
  }

  const hashedPassword = await hashPassword(data.password);
  const now = new Date();

  const user = await repository.createUserWithLedger(
    {
      uname: data.uname,
      lname: data.lname,
      uemail: normalizedEmail,
      uphone: data.phone,
      upass: hashedPassword,
      utype: data.utype,
      date: now.toISOString(),
      dateofbirth: data.dateOfBirth || null,
      Address: data.Address || null,
      city: data.city || null,
      state: data.state || null,
      ugender: data.gender || null,
      company: data.company || null,
      Companyaddress: data.companyAddress || null,
      wphone: data.wphone || null,
      fb: data.fb || null,
      linkedin: data.linkedin || null,
      tiktok: data.tiktok || null,
      instagram: data.instagram || null,
      twitter: data.twitter || null,
      website: data.website || null,
      uloginvalue: 1,
      deactivate: 1,
    },
    {
      email: normalizedEmail,
      name: `${data.uname} ${data.lname}`,
      type: "registered",
      utype: data.utype,
    }
  );

  return mapper.toSession(user, tokens.issuePair(user.uid, user.uemail, "user", user.tokenVersion));
}

/**
 * `POST /login`.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} the session: `{ user, accessToken, refreshToken }`
 */
async function loginUser(email, password) {
  const normalizedEmail = normalizeEmail(email);

  const user = await repository.findUserByEmail(normalizedEmail);

  policy.assertNotBlocked(
    { deleted: Boolean(await repository.findDeletedAccountByEmail(normalizedEmail)), blocked: user?.adminblock === 1 },
    { message: "This account has been blocked", code: "ACCOUNT_BLOCKED" }
  );

  // One message for "no such user" and "wrong password", and the same work either
  // way, so the endpoint cannot be used to enumerate registered addresses.
  if (!user) {
    await verifyPassword(password, DUMMY_HASH);
    throw new AppError("Email or password does not match", 401, "AUTH_FAILED");
  }

  const { ok, upgrade } = await verifyPassword(password, user.upass);
  if (!ok) {
    throw new AppError("Email or password does not match", 401, "AUTH_FAILED");
  }

  if (upgrade) await repository.upgradePasswordHash(user.uid, upgrade);
  await repository.markLogin(user.uid);

  return mapper.toSession(user, tokens.issuePair(user.uid, user.uemail, "user", user.tokenVersion));
}

/**
 * A real cost-12 hash of a value nobody knows, compared against when the address is
 * unknown.
 *
 * Without it, "no such user" returns in the time bcrypt takes and "wrong password"
 * takes the same — and the difference *is* the enumeration oracle. A fixed dummy
 * also costs one hash per unknown address, which is the point.
 */
const DUMMY_HASH = bcrypt.hashSync("amaken-nonexistent-account", BCRYPT_COST);

/**
 * `POST /forgot-password`.
 *
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
async function sendForgotPasswordOtp(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!(await repository.findUserByEmail(normalizedEmail))) {
    throw new AppError("Email not found", 404, "EMAIL_NOT_FOUND");
  }

  const otp = await storeOtp(normalizedEmail, OTP_PURPOSE.FORGOT_PASSWORD);

  // Queued, as with registration: SMTP is not in the user's critical path, and the
  // retry policy means a transient SMTP failure no longer loses the reset.
  await queue.enqueueOtpEmail({ to: normalizedEmail, otp, purpose: "reset" });

  return { message: "Password reset code sent to your email" };
}

/**
 * `POST /verify-forgot-otp` — trades a code for a short-lived reset token.
 *
 * @param {string} email
 * @param {string} code
 * @returns {Promise<{ resetToken: string, message: string }>}
 */
async function verifyForgotPasswordOtp(email, code) {
  const normalizedEmail = normalizeEmail(email);
  const valid = await verifyOtp(normalizedEmail, code, OTP_PURPOSE.FORGOT_PASSWORD);

  if (!valid) {
    throw new AppError("Invalid or expired verification code", 400, "OTP_INVALID");
  }

  // Also on the shared store since M02 — the old `Map` meant a token minted on
  // replica A could not be redeemed on replica B, so password reset failed at
  // random under any load balancing.
  const resetToken = crypto.randomBytes(32).toString("hex");
  await cache.set(
    OTP_NAMESPACE,
    resetTokenKey(normalizedEmail),
    { code: resetToken, purpose: "reset_token" },
    RESET_TOKEN_TTL_SECONDS
  );

  return { resetToken, message: "OTP verified. Use the reset token to set a new password." };
}

/**
 * `POST /reset-password`.
 *
 * Bumps `tokenVersion`, which is the only reason this endpoint changes anything an
 * attacker can see: without it, the refresh token they are holding keeps working
 * for its full seven days and the reset is theatre.
 *
 * @param {string} email
 * @param {string} resetToken
 * @param {string} newPassword
 * @returns {Promise<{ message: string }>}
 */
async function resetPassword(email, resetToken, newPassword) {
  const normalizedEmail = normalizeEmail(email);
  const key = resetTokenKey(normalizedEmail);

  // Read then delete, so the token is single-use even when the comparison fails. A
  // reset token that survived a failed attempt would be a permanent credential.
  const stored = await cache.get(OTP_NAMESPACE, key);
  await cache.del(OTP_NAMESPACE, key);

  // One message for "unknown" and "wrong", so the endpoint cannot be used to
  // confirm which email addresses have an outstanding reset.
  const invalid = new AppError("Invalid or expired reset token", 400, "RESET_TOKEN_INVALID");

  if (!stored || stored.purpose !== "reset_token") throw invalid;

  // `timingSafeEqual` for the same reason `verifyOtp` uses it: a 64-character hex
  // token compared with `===` leaks its prefix through timing.
  const expected = Buffer.from(stored.code);
  const actual = Buffer.from(String(resetToken));
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) throw invalid;

  const hashedPassword = await hashPassword(newPassword);
  await repository.replacePassword(normalizedEmail, hashedPassword, new Date().toISOString());

  return { message: "Password updated successfully" };
}

/**
 * `POST /refresh` — one endpoint for both roles, dispatching on the signed claim.
 *
 * The order of the checks is the security-relevant part:
 *
 *   1. signature / expiry / type — cheap, and the reason is reported distinctly;
 *   2. role — so an unknown role cannot be used to probe which tables exist;
 *   3. **rotation** — before the database read, because a replayed token is
 *      rejected on the credential alone and revoking the family should not depend
 *      on a `SELECT` succeeding;
 *   4. the row exists, and `tokenVersion` matches.
 *
 * @param {string} rawRefreshToken
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
async function refreshTokens(rawRefreshToken) {
  const verification = tokens.verifyRefresh(rawRefreshToken);
  if (!verification.ok) throw refreshRejection(verification.reason);

  const { payload } = verification;
  policy.assertRefreshPrincipal(payload);

  const rotation = await tokens.acceptRotation({ payload, rawToken: rawRefreshToken });
  if (!rotation.ok) throw refreshRejection(rotation.reason);

  const principal =
    payload.role === "admin"
      ? await repository.findAdminByEmail(payload.email)
      : await repository.findUserByEmail(payload.email);

  if (!principal) {
    throw new AppError(
      payload.role === "admin" ? "Admin not found" : "User not found",
      404,
      payload.role === "admin" ? "ADMIN_NOT_FOUND" : "USER_NOT_FOUND"
    );
  }

  // A token minted before a password reset carries the old version and stops here.
  const rowVersion = tokens.normalizeTokenVersion(principal.tokenVersion);
  if (tokens.normalizeTokenVersion(payload.tokenVersion) !== rowVersion) {
    throw new AppError("Session is no longer valid, please sign in again", 401, "TOKEN_REVOKED");
  }

  const pair = tokens.issuePair(
    principal.aid ?? principal.uid,
    principal.aemail ?? principal.uemail,
    payload.role,
    rowVersion,
    // Same family. A rotated pair that started a new family would leave the old
    // one holding no live token, so the reuse check would have nothing to compare
    // against and family revocation would stop working at exactly the moment it
    // is needed.
    rotation.family
  );

  await tokens.completeRotation({
    family: rotation.family,
    previous: payload,
    previousState: rotation.state,
    pair,
    ttlSeconds: pair.refreshTtlSeconds,
  });

  return mapper.toTokenPair(pair);
}

/**
 * One place that turns a verification or rotation failure into an HTTP-shaped
 * error.
 *
 * Expiry is separated from everything else because they mean different things: a
 * client that slept should refresh, and a token that failed its signature should not
 * be retried. `REFRESH_INVALID` is the code the endpoint has always returned, so it
 * is what everything non-expiry falls back to — including a replayed token, where
 * telling the caller "this was reused" would be a free oracle for anyone holding a
 * stolen one.
 *
 * @param {string} reason
 * @returns {AppError}
 */
function refreshRejection(reason) {
  if (reason === tokens.VerifyFailure.EXPIRED) {
    return new AppError("Refresh token expired", 401, "TOKEN_EXPIRED");
  }

  return new AppError("Invalid or expired refresh token", 401, "REFRESH_INVALID");
}

/**
 * `POST /logout`.
 *
 * The response is the pre-M03 one, verbatim, because the M00 baseline pins it and
 * because a logout that fails loudly teaches a client to retry it. What is new is
 * what happens *server-side* when the caller does present its token: the token and
 * its family are denied, so a copied `localStorage` entry stops working immediately
 * instead of at its natural expiry.
 *
 * @param {string} [rawToken] the presented `Authorization: Bearer …`, if any
 * @returns {{ message: string }}
 */
function logout(rawToken) {
  tokens.revoke(rawToken);
  return { message: "Logged out successfully" };
}

/**
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  return String(email).toLowerCase().trim();
}

module.exports = {
  // the nine operations
  sendVerificationOtp,
  verifyRegistrationOtp,
  completeRegistration,
  loginUser,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  refreshTokens,
  logout,
  // one function, so M04 can promote it to `password.service` without a rewrite
  hashPassword,
  verifyPassword,
};