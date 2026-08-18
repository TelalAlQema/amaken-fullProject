import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { generateTokenPair, verifyRefreshToken } from "./jwt.service";
import { sendOtpEmail, sendPasswordResetEmail, sendAdminNotificationEmail } from "./email.service";
import { AppError } from "../middleware/errorHandler";

// In-memory OTP store (production: use Redis)
const otpStore = new Map<string, { code: string; expiresAt: number; purpose: string }>();

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function storeOtp(email: string, purpose: string, ttlMs = 600000): string {
  const code = generateOtp();
  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + ttlMs,
    purpose,
  });
  return code;
}

function verifyOtp(email: string, code: string, purpose: string): boolean {
  const key = email.toLowerCase();
  const stored = otpStore.get(key);
  if (!stored) return false;
  if (stored.purpose !== purpose) return false;
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return false;
  }
  if (stored.code !== code) return false;
  otpStore.delete(key);
  return true;
}

async function checkBlockedOrDeleted(email: string): Promise<boolean> {
  const deleted = await prisma.delAccount.findFirst({ where: { email: email.toLowerCase() } });
  return !!deleted;
}

// ─── Email Verification (Step 1: send OTP) ───────────────────────────
export async function sendVerificationOtp(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.registerEmail.findFirst({ where: { email: normalizedEmail } });
  if (existing) {
    throw new AppError(`Email already has a ${existing.utype}-${existing.type} account`, 409, "EMAIL_EXISTS");
  }

  const user = await prisma.user.findFirst({ where: { uemail: normalizedEmail } });
  if (user) {
    throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
  }

  if (await checkBlockedOrDeleted(normalizedEmail)) {
    throw new AppError("This email has been blocked", 403, "EMAIL_BLOCKED");
  }

  const otp = storeOtp(normalizedEmail, "register", 600000);
  await sendOtpEmail(normalizedEmail, otp);

  // Also notify admin
  await sendAdminNotificationEmail("info@amaken-realestate.com", normalizedEmail);

  return { message: "Verification code sent to your email" };
}

// ─── Verify OTP (Step 2) ────────────────────────────────────────────
export function verifyRegistrationOtp(email: string, code: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const valid = verifyOtp(normalizedEmail, code, "register");
  if (!valid) {
    throw new AppError("Invalid or expired verification code", 400, "OTP_INVALID");
  }
  return { message: "Email verified successfully", email: normalizedEmail };
}

// ─── Complete Registration ──────────────────────────────────────────
export async function completeRegistration(data: {
  email: string;
  uname: string;
  lname: string;
  phone: string;
  password: string;
  utype: "User" | "Agent" | "Builder";
  dateOfBirth?: string;
  Address?: string;
  city?: string;
  state?: string;
  gender?: "Male" | "Female" | "Other";
  company?: string;
  companyAddress?: string;
  wphone?: string;
  fb?: string;
  linkedin?: string;
  tiktok?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}) {
  const normalizedEmail = data.email.toLowerCase().trim();

  if (await checkBlockedOrDeleted(normalizedEmail)) {
    throw new AppError("This email has been blocked", 403, "EMAIL_BLOCKED");
  }

  const existing = await prisma.user.findFirst({ where: { uemail: normalizedEmail } });
  if (existing) {
    throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const now = new Date();
  const user = await prisma.user.create({
    data: {
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
  });

  // Record in register_email
  await prisma.registerEmail.create({
    data: {
      email: normalizedEmail,
      name: `${data.uname} ${data.lname}`,
      type: "registered",
      utype: data.utype,
    },
  });

  const tokens = generateTokenPair(user.uid, user.uemail, "user");

  return {
    user: {
      id: user.uid,
      email: user.uemail,
      name: `${user.uname} ${user.lname}`,
      type: user.utype,
    },
    ...tokens,
  };
}

// ─── Login ───────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check blocked/deleted
  if (await checkBlockedOrDeleted(normalizedEmail)) {
    throw new AppError("This account has been blocked", 403, "ACCOUNT_BLOCKED");
  }

  const user = await prisma.user.findFirst({ where: { uemail: normalizedEmail } });
  if (!user) {
    throw new AppError("Email or password does not match", 401, "AUTH_FAILED");
  }

  // Check admin block
  if (user.adminblock === 1) {
    throw new AppError("This account has been blocked", 403, "ACCOUNT_BLOCKED");
  }

  let passwordOk = false;
  const stored = user.upass;

  // Modern bcrypt verify
  if (stored.startsWith("$2") || stored.startsWith("$argon")) {
    passwordOk = await bcrypt.compare(password, stored);
    // Upgrade cost if needed
    if (passwordOk && bcrypt.getRounds(stored) < 12) {
      const newHash = await bcrypt.hash(password, 12);
      await prisma.user.update({ where: { uid: user.uid }, data: { upass: newHash } });
    }
  } else {
    // Legacy SHA-256 fallback
    const sha256 = crypto.createHash("sha256").update(password).digest("hex");
    if (sha256 === stored) {
      passwordOk = true;
      const newHash = await bcrypt.hash(password, 12);
      await prisma.user.update({ where: { uid: user.uid }, data: { upass: newHash } });
    }
  }

  if (!passwordOk) {
    throw new AppError("Email or password does not match", 401, "AUTH_FAILED");
  }

  // Update login state
  await prisma.user.update({
    where: { uid: user.uid },
    data: { uloginvalue: 1 },
  });

  const tokens = generateTokenPair(user.uid, user.uemail, "user");

  return {
    user: {
      id: user.uid,
      email: user.uemail,
      name: `${user.uname} ${user.lname}`,
      type: user.utype,
      image: user.uimage,
    },
    ...tokens,
  };
}

// ─── Forgot Password (send OTP) ────────────────────────────────────
export async function sendForgotPasswordOtp(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findFirst({ where: { uemail: normalizedEmail } });
  if (!user) {
    throw new AppError("Email not found", 404, "EMAIL_NOT_FOUND");
  }

  const otp = storeOtp(normalizedEmail, "forgot_password", 600000);
  await sendPasswordResetEmail(normalizedEmail, otp);

  return { message: "Password reset code sent to your email" };
}

// ─── Verify Forgot Password OTP ─────────────────────────────────────
export function verifyForgotPasswordOtp(email: string, code: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const valid = verifyOtp(normalizedEmail, code, "forgot_password");
  if (!valid) {
    throw new AppError("Invalid or expired verification code", 400, "OTP_INVALID");
  }
  // Generate a short-lived reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  // Store reset token with short TTL
  otpStore.set(`reset_${normalizedEmail}`, {
    code: resetToken,
    expiresAt: Date.now() + 900000, // 15 minutes
    purpose: "reset_token",
  });
  return { resetToken, message: "OTP verified. Use the reset token to set a new password." };
}

// ─── Reset Password ─────────────────────────────────────────────────
export async function resetPassword(email: string, resetToken: string, newPassword: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `reset_${normalizedEmail}`;
  const stored = otpStore.get(key);

  if (!stored || stored.purpose !== "reset_token" || stored.code !== resetToken) {
    throw new AppError("Invalid or expired reset token", 400, "RESET_TOKEN_INVALID");
  }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    throw new AppError("Reset token has expired", 400, "RESET_TOKEN_EXPIRED");
  }

  otpStore.delete(key);

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  const now = new Date();

  await prisma.user.updateMany({
    where: { uemail: normalizedEmail },
    data: { upass: hashedPassword, udate: now },
  });

  return { message: "Password updated successfully" };
}

// ─── Refresh Token ──────────────────────────────────────────────────
export async function refreshTokens(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError("Invalid or expired refresh token", 401, "REFRESH_INVALID");
  }

  if (payload.role === "user") {
    const user = await prisma.user.findFirst({ where: { uemail: payload.email } });
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return generateTokenPair(user.uid, user.uemail, "user");
  } else {
    const admin = await prisma.admin.findFirst({ where: { aemail: payload.email } });
    if (!admin) {
      throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");
    }
    return generateTokenPair(admin.aid, admin.aemail, "admin");
  }
}

// ─── Logout (client-side token discard) ─────────────────────────────
export function logout() {
  return { message: "Logged out successfully" };
}
