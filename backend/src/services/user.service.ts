import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import {
  processAndSaveImage,
  deleteFileIfExists,
  getUserUploadDir,
  getFilePath,
} from "./upload.service";

function isLegacyHash(hash: string): boolean {
  return !hash.startsWith("$2") && !hash.startsWith("$argon");
}

async function verifyPasswordLegacy(currentPassword: string, storedHash: string): Promise<boolean> {
  if (isLegacyHash(storedHash)) {
    const sha256 = crypto.createHash("sha256").update(currentPassword).digest("hex");
    return sha256 === storedHash;
  }
  return bcrypt.compare(currentPassword, storedHash);
}

// ─── Get Current User Profile ───────────────────────────────────────
export async function getProfile(userId: number) {
  const user = await prisma.user.findFirst({
    where: { uid: userId },
    select: {
      uid: true,
      uname: true,
      lname: true,
      uemail: true,
      uphone: true,
      utype: true,
      uimage: true,
      dateofbirth: true,
      Address: true,
      company: true,
      ucompanylogo: true,
      state: true,
      city: true,
      Companyaddress: true,
      ugender: true,
      wphone: true,
      fb: true,
      linkedin: true,
      tiktok: true,
      instagram: true,
      twitter: true,
      website: true,
      deactivate: true,
      adminblock: true,
      editprofile: true,
      editcomlogo: true,
      editpropic: true,
      linkpagedate: true,
      lastseen: true,
      udate: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
}

// ─── Update Profile ─────────────────────────────────────────────────
export async function updateProfile(
  userId: number,
  data: {
    uname?: string;
    lname?: string;
    phone?: string;
    address?: string;
    company?: string;
    companyAddress?: string;
    state?: string;
    city?: string;
    gender?: "Male" | "Female" | "Other";
    dateOfBirth?: string;
    wphone?: string;
    utype?: "User" | "Agent" | "Builder";
  }
) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const updateData: Record<string, any> = {};
  if (data.uname !== undefined) updateData.uname = data.uname.substring(0, 100);
  if (data.lname !== undefined) updateData.lname = data.lname.substring(0, 100);
  if (data.phone !== undefined) updateData.uphone = data.phone.substring(0, 20);
  if (data.address !== undefined) updateData.Address = data.address.substring(0, 200);
  if (data.company !== undefined) updateData.company = data.company.substring(0, 100);
  if (data.companyAddress !== undefined) updateData.Companyaddress = data.companyAddress.substring(0, 200);
  if (data.state !== undefined) updateData.state = data.state;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.gender !== undefined) updateData.ugender = data.gender;
  if (data.dateOfBirth !== undefined) updateData.dateofbirth = data.dateOfBirth;
  if (data.wphone !== undefined) updateData.wphone = data.wphone.substring(0, 20);
  if (data.utype !== undefined) updateData.utype = data.utype;
  updateData.editprofile = new Date();

  const updated = await prisma.user.update({
    where: { uid: userId },
    data: updateData,
    select: {
      uid: true,
      uname: true,
      lname: true,
      uemail: true,
      uphone: true,
      utype: true,
      uimage: true,
      ucompanylogo: true,
      Address: true,
      company: true,
      Companyaddress: true,
      state: true,
      city: true,
      ugender: true,
      wphone: true,
      dateofbirth: true,
    },
  });

  return updated;
}

// ─── Upload Profile Image ───────────────────────────────────────────
export async function uploadProfileImage(userId: number, file: Express.Multer.File) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const userDir = getUserUploadDir();

  // Delete old image
  if (user.uimage) {
    deleteFileIfExists(getFilePath(userDir, user.uimage));
  }

  const filename = await processAndSaveImage(file, userDir, "user", 400, 400);

  await prisma.user.update({
    where: { uid: userId },
    data: { uimage: filename, editpropic: new Date() },
  });

  return { image: filename, message: "Profile image updated" };
}

// ─── Remove Profile Image ───────────────────────────────────────────
export async function removeProfileImage(userId: number) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (user.uimage) {
    const userDir = getUserUploadDir();
    deleteFileIfExists(getFilePath(userDir, user.uimage));
  }

  await prisma.user.update({
    where: { uid: userId },
    data: { uimage: "", editpropic: new Date() },
  });

  return { message: "Profile image removed" };
}

// ─── Upload Company Logo ────────────────────────────────────────────
export async function uploadCompanyLogo(userId: number, file: Express.Multer.File) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const userDir = getUserUploadDir();

  // Delete old logo
  if (user.ucompanylogo) {
    deleteFileIfExists(getFilePath(userDir, user.ucompanylogo));
  }

  const filename = await processAndSaveImage(file, userDir, "logo", 500, 500);

  await prisma.user.update({
    where: { uid: userId },
    data: { ucompanylogo: filename, editcomlogo: new Date() },
  });

  return { logo: filename, message: "Company logo updated" };
}

// ─── Remove Company Logo ────────────────────────────────────────────
export async function removeCompanyLogo(userId: number) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (user.ucompanylogo) {
    const userDir = getUserUploadDir();
    deleteFileIfExists(getFilePath(userDir, user.ucompanylogo));
  }

  await prisma.user.update({
    where: { uid: userId },
    data: { ucompanylogo: "", editcomlogo: new Date() },
  });

  return { message: "Company logo removed" };
}

// ─── Update Social Links ────────────────────────────────────────────
export async function updateSocialLinks(
  userId: number,
  data: {
    fb?: string;
    linkedin?: string;
    tiktok?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  }
) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  await prisma.user.update({
    where: { uid: userId },
    data: {
      fb: data.fb || null,
      linkedin: data.linkedin || null,
      tiktok: data.tiktok || null,
      instagram: data.instagram || null,
      twitter: data.twitter || null,
      website: data.website || null,
      linkpagedate: new Date(),
    },
  });

  return { message: "Social links updated" };
}

// ─── Change Password ────────────────────────────────────────────────
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const valid = await verifyPasswordLegacy(currentPassword, user.upass);
  if (!valid) {
    throw new AppError("Current password is incorrect", 400, "PASSWORD_INCORRECT");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { uid: userId },
    data: { upass: hashedPassword, udate: new Date() },
  });

  return { message: "Password updated successfully" };
}

// ─── Deactivate Account ─────────────────────────────────────────────
export async function deactivateAccount(userId: number) {
  await prisma.$transaction([
    prisma.user.update({
      where: { uid: userId },
      data: { deactivate: 0, uloginvalue: 0, lastseen: new Date().toISOString() },
    }),
  ]);

  return { message: "Account deactivated" };
}

// ─── Activate Account ───────────────────────────────────────────────
export async function activateAccount(userId: number) {
  await prisma.$transaction([
    prisma.user.update({
      where: { uid: userId },
      data: { deactivate: 1, uloginvalue: 1, lastseen: new Date().toISOString() },
    }),
  ]);

  return { message: "Account activated" };
}

// ─── Delete Account ─────────────────────────────────────────────────
export async function deleteAccount(userId: number) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  // Delete images
  if (user.uimage) {
    deleteFileIfExists(getFilePath(getUserUploadDir(), user.uimage));
  }
  if (user.ucompanylogo) {
    deleteFileIfExists(getFilePath(getUserUploadDir(), user.ucompanylogo));
  }

  // Delete user
  await prisma.user.delete({ where: { uid: userId } });

  return { message: "Account deleted" };
}

// ─── Self Block (sets adminblock=1, unblocks properties) ─────────────
export async function blockSelf(userId: number) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  await prisma.$transaction([
    prisma.property.updateMany({
      where: { uid: userId, email: user.uemail },
      data: { blocked_user: 0 },
    }),
    prisma.user.update({
      where: { uid: userId },
      data: { adminblock: 1 },
    }),
  ]);

  return { message: "Account blocked" };
}

// ─── Self Unblock (sets adminblock=0, restores properties) ──────────
export async function unblockSelf(userId: number) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  await prisma.$transaction([
    prisma.property.updateMany({
      where: { uid: userId, email: user.uemail },
      data: { blocked_user: 1 },
    }),
    prisma.user.update({
      where: { uid: userId },
      data: { adminblock: 0 },
    }),
  ]);

  return { message: "Account unblocked" };
}

// ─── Get Public User Profile ────────────────────────────────────────
export async function getPublicProfile(userId: number) {
  const user = await prisma.user.findFirst({
    where: { uid: userId, deactivate: 1 },
    select: {
      uid: true,
      uname: true,
      lname: true,
      uemail: true,
      utype: true,
      uimage: true,
      company: true,
      ucompanylogo: true,
      state: true,
      city: true,
      ugender: true,
      fb: true,
      linkedin: true,
      tiktok: true,
      instagram: true,
      twitter: true,
      website: true,
      lastseen: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
}
