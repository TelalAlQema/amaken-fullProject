import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { generateTokenPair } from "./jwt.service";
import {
  processAndSaveImage,
  deleteFileIfExists,
  getUserUploadDir,
  getFilePath,
} from "./upload.service";

// ─── Admin PIN Verification (Step 1) ────────────────────────────────
export async function verifyAdminPin(pin: string) {
  const pinRecord = await prisma.pin.findFirst({
    orderBy: { id: "asc" },
  });

  if (!pinRecord) {
    throw new AppError("Admin PIN not configured", 500, "PIN_NOT_FOUND");
  }

  const valid = await bcrypt.compare(pin, pinRecord.upin);
  if (!valid) {
    throw new AppError("Invalid PIN", 401, "PIN_INVALID");
  }

  return {
    message: "PIN verified successfully",
    step: "email_password",
  };
}

// ─── Admin Email/Password Login (Step 2) ────────────────────────────
export async function adminLogin(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const admin = await prisma.admin.findFirst({
    where: { aemail: normalizedEmail },
  });

  if (!admin) {
    throw new AppError("Email or password does not match", 401, "AUTH_FAILED");
  }

  // Check admin block (skip for main admin with phone 552615993)
  if (admin.adminblock === 1 && admin.main !== "552615993") {
    throw new AppError("This account has been blocked", 403, "ACCOUNT_BLOCKED");
  }

  let passwordOk = false;
  const stored = admin.apass;

  // Modern bcrypt verify
  if (stored.startsWith("$2") || stored.startsWith("$argon")) {
    passwordOk = await bcrypt.compare(password, stored);
    if (passwordOk && bcrypt.getRounds(stored) < 12) {
      const newHash = await bcrypt.hash(password, 12);
      await prisma.admin.update({ where: { aid: admin.aid }, data: { apass: newHash } });
    }
  } else {
    // Legacy SHA-1 fallback
    const sha1 = crypto.createHash("sha1").update(password).digest("hex");
    if (sha1 === stored) {
      passwordOk = true;
      const newHash = await bcrypt.hash(password, 12);
      await prisma.admin.update({ where: { aid: admin.aid }, data: { apass: newHash } });
    }
  }

  if (!passwordOk) {
    throw new AppError("Email or password does not match", 401, "AUTH_FAILED");
  }

  await prisma.admin.update({
    where: { aid: admin.aid },
    data: { aloginvalue: 1 },
  });

  const tokens = generateTokenPair(admin.aid, admin.aemail, "admin");

  return {
    admin: {
      id: admin.aid,
      email: admin.aemail,
      name: `${admin.aname} ${admin.alname}`,
      type: admin.atype,
      image: admin.aimage,
    },
    ...tokens,
  };
}

// ─── Admin Profile ──────────────────────────────────────────────────
export async function getAdminProfile(adminId: number) {
  const admin = await prisma.admin.findFirst({
    where: { aid: adminId },
    select: {
      aid: true,
      aname: true,
      alname: true,
      aemail: true,
      aphone: true,
      atype: true,
      aimage: true,
      agency: true,
      companylogo: true,
      astate: true,
      acity: true,
      agender: true,
      adateofbirth: true,
      aAddress: true,
      awphone: true,
      adminblock: true,
      main: true,
      website: true,
      afb: true,
      ainstagram: true,
      atwitter: true,
      atiktok: true,
      alinkedin: true,
    },
  });

  if (!admin) {
    throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");
  }

  return admin;
}

export async function updateAdminProfile(
  adminId: number,
  data: {
    aname?: string;
    alname?: string;
    aphone?: string;
    agency?: string;
    astate?: string;
    acity?: string;
    agender?: "Male" | "Female" | "Other";
    adateofbirth?: string;
    aAddress?: string;
    awphone?: string;
    website?: string;
    afb?: string;
    ainstagram?: string;
    atwitter?: string;
    atiktok?: string;
    alinkedin?: string;
  }
) {
  const admin = await prisma.admin.findFirst({ where: { aid: adminId } });
  if (!admin) {
    throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");
  }

  const updateData: Record<string, any> = {};
  if (data.aname !== undefined) updateData.aname = data.aname.substring(0, 100);
  if (data.alname !== undefined) updateData.alname = data.alname.substring(0, 100);
  if (data.aphone !== undefined) updateData.aphone = data.aphone.substring(0, 20);
  if (data.agency !== undefined) updateData.agency = data.agency.substring(0, 100);
  if (data.astate !== undefined) updateData.astate = data.astate;
  if (data.acity !== undefined) updateData.acity = data.acity;
  if (data.agender !== undefined) updateData.agender = data.agender;
  if (data.adateofbirth !== undefined) updateData.adateofbirth = data.adateofbirth;
  if (data.aAddress !== undefined) updateData.aAddress = data.aAddress.substring(0, 200);
  if (data.awphone !== undefined) updateData.awphone = data.awphone.substring(0, 20);
  if (data.website !== undefined) updateData.website = data.website;
  if (data.afb !== undefined) updateData.afb = data.afb;
  if (data.ainstagram !== undefined) updateData.ainstagram = data.ainstagram;
  if (data.atwitter !== undefined) updateData.atwitter = data.atwitter;
  if (data.atiktok !== undefined) updateData.atiktok = data.atiktok;
  if (data.alinkedin !== undefined) updateData.alinkedin = data.alinkedin;

  const updated = await prisma.admin.update({
    where: { aid: adminId },
    data: updateData,
  });

  return updated;
}

// ─── Admin Upload Image ─────────────────────────────────────────────
export async function uploadAdminImage(adminId: number, file: Express.Multer.File) {
  const admin = await prisma.admin.findFirst({ where: { aid: adminId } });
  if (!admin) throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");

  const userDir = getUserUploadDir();
  if (admin.aimage) {
    deleteFileIfExists(getFilePath(userDir, admin.aimage));
  }

  const filename = await processAndSaveImage(file, userDir, "admin", 400, 400);
  await prisma.admin.update({ where: { aid: adminId }, data: { aimage: filename } });
  return { image: filename, message: "Admin image updated" };
}

export async function removeAdminImage(adminId: number) {
  const admin = await prisma.admin.findFirst({ where: { aid: adminId } });
  if (!admin) throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");

  if (admin.aimage) {
    deleteFileIfExists(getFilePath(getUserUploadDir(), admin.aimage));
  }
  await prisma.admin.update({ where: { aid: adminId }, data: { aimage: "" } });
  return { message: "Admin image removed" };
}

// ─── Admin Upload Logo ──────────────────────────────────────────────
export async function uploadAdminLogo(adminId: number, file: Express.Multer.File) {
  const admin = await prisma.admin.findFirst({ where: { aid: adminId } });
  if (!admin) throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");

  const userDir = getUserUploadDir();
  if (admin.companylogo) {
    deleteFileIfExists(getFilePath(userDir, admin.companylogo));
  }

  const filename = await processAndSaveImage(file, userDir, "adminlogo", 500, 500);
  await prisma.admin.update({ where: { aid: adminId }, data: { companylogo: filename } });
  return { logo: filename, message: "Admin logo updated" };
}

export async function removeAdminLogo(adminId: number) {
  const admin = await prisma.admin.findFirst({ where: { aid: adminId } });
  if (!admin) throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");

  if (admin.companylogo) {
    deleteFileIfExists(getFilePath(getUserUploadDir(), admin.companylogo));
  }
  await prisma.admin.update({ where: { aid: adminId }, data: { companylogo: "" } });
  return { message: "Admin logo removed" };
}

// ─── Admin Update Social Links ──────────────────────────────────────
export async function updateAdminSocialLinks(
  adminId: number,
  data: {
    website?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
  }
) {
  await prisma.adminSocial.upsert({
    where: { admin_id: adminId },
    create: {
      admin_id: adminId,
      website: data.website || null,
      facebook: data.facebook || null,
      linkedin: data.linkedin || null,
      instagram: data.instagram || null,
      tiktok: data.tiktok || null,
      twitter: data.twitter || null,
    },
    update: {
      website: data.website ?? undefined,
      facebook: data.facebook ?? undefined,
      linkedin: data.linkedin ?? undefined,
      instagram: data.instagram ?? undefined,
      tiktok: data.tiktok ?? undefined,
      twitter: data.twitter ?? undefined,
      updated_at: new Date(),
    },
  });

  return { message: "Social links updated" };
}

// ─── Admin Change Password ──────────────────────────────────────────
export async function changeAdminPassword(
  adminId: number,
  currentPassword: string,
  newPassword: string
) {
  const admin = await prisma.admin.findFirst({ where: { aid: adminId } });
  if (!admin) throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");

  const valid = await bcrypt.compare(currentPassword, admin.apass);
  if (!valid) {
    throw new AppError("Current password is incorrect", 400, "PASSWORD_INCORRECT");
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({ where: { aid: adminId }, data: { apass: hashed } });
  return { message: "Password updated successfully" };
}

// ─── List All Users (by type) ───────────────────────────────────────
export async function listUsers(
  type?: "User" | "Agent" | "Builder",
  page = 1,
  limit = 50
) {
  const where: any = {};
  if (type) where.utype = type;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        uid: true,
        uname: true,
        lname: true,
        uemail: true,
        utype: true,
        uimage: true,
        ugender: true,
        adminblock: true,
        deactivate: true,
        uloginvalue: true,
        lastseen: true,
      },
      orderBy: { uid: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── List All Admins ────────────────────────────────────────────────
export async function listAdmins() {
  return prisma.admin.findMany({
    select: {
      aid: true,
      aname: true,
      alname: true,
      aemail: true,
      aphone: true,
      atype: true,
      aimage: true,
      adminblock: true,
      main: true,
      adeactivate: true,
    },
    orderBy: { aid: "asc" },
  });
}

// ─── Admin Freeze User (block) ──────────────────────────────────────
export async function adminFreezeUser(userId: number) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  const now = new Date().toISOString();

  await prisma.$transaction([
    prisma.user.update({
      where: { uid: userId },
      data: { uloginvalue: 0, lastseen: now, adminblock: 1 },
    }),
    prisma.property.updateMany({
      where: { email: user.uemail },
      data: { adminblock: 1 },
    }),
    prisma.feedback.updateMany({
      where: { send_email: user.uemail },
      data: { fadminblock: 1 },
    }),
    prisma.delAccount.upsert({
      where: { id: (await prisma.delAccount.findFirst({ where: { email: user.uemail } }))?.id ?? -1 },
      create: {
        email: user.uemail,
        type: "block",
        utype: "user",
        date: now,
      },
      update: {
        type: "block",
        date: now,
      },
    }),
  ]);

  return { message: "User frozen" };
}

// ─── Admin Unfreeze User ────────────────────────────────────────────
export async function adminUnfreezeUser(userId: number) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  await prisma.$transaction([
    prisma.user.update({
      where: { uid: userId },
      data: { adminblock: 0 },
    }),
    prisma.property.updateMany({
      where: { email: user.uemail },
      data: { adminblock: 0 },
    }),
    prisma.feedback.updateMany({
      where: { send_email: user.uemail },
      data: { fadminblock: 0 },
    }),
    prisma.delAccount.deleteMany({
      where: { email: user.uemail },
    }),
  ]);

  return { message: "User unfrozen" };
}

// ─── Admin Activate User ────────────────────────────────────────────
export async function adminActivateUser(userId: number) {
  await prisma.user.update({
    where: { uid: userId },
    data: { deactivate: 1 },
  });
  return { message: "User activated" };
}

// ─── Admin Deactivate User ──────────────────────────────────────────
export async function adminDeactivateUser(userId: number) {
  await prisma.user.update({
    where: { uid: userId },
    data: { deactivate: 0 },
  });
  return { message: "User deactivated" };
}

// ─── Admin Delete User ──────────────────────────────────────────────
export async function adminDeleteUser(userId: number) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  const now = new Date().toISOString();

  await prisma.$transaction([
    prisma.user.update({
      where: { uid: userId },
      data: { uloginvalue: 0, lastseen: now },
    }),
    prisma.delAccount.upsert({
      where: { id: (await prisma.delAccount.findFirst({ where: { email: user.uemail } }))?.id ?? -1 },
      create: {
        email: user.uemail,
        type: "delete",
        utype: "user",
        date: now,
      },
      update: {
        type: "delete",
        date: now,
      },
    }),
    prisma.user.delete({ where: { uid: userId } }),
    prisma.property.deleteMany({ where: { email: user.uemail } }),
    prisma.feedback.deleteMany({ where: { send_email: user.uemail } }),
  ]);

  return { message: "User deleted" };
}

// ─── Account Lists ──────────────────────────────────────────────────
export async function listRegisteredAccounts(page = 1, limit = 50) {
  const [accounts, total] = await Promise.all([
    prisma.registerEmail.findMany({
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.registerEmail.count(),
  ]);

  return {
    accounts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listDeletedAccounts(page = 1, limit = 50) {
  const [accounts, total] = await Promise.all([
    prisma.delAccount.findMany({
      where: { type: "delete" },
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.delAccount.count({ where: { type: "delete" } }),
  ]);

  return {
    accounts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listBlockedAccounts(page = 1, limit = 50) {
  const [accounts, total] = await Promise.all([
    prisma.delAccount.findMany({
      where: { type: "block" },
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.delAccount.count({ where: { type: "block" } }),
  ]);

  return {
    accounts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function deleteAccountRecord(id: number) {
  const record = await prisma.delAccount.findFirst({ where: { id } });
  if (!record) throw new AppError("Account record not found", 404, "NOT_FOUND");

  await prisma.delAccount.delete({ where: { id } });
  return { message: "Account record deleted" };
}
