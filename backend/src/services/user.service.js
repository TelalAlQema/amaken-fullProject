const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { prisma } = require("../platform/db/prisma");
const { AppError } = require("../middleware/errorHandler");
const {
  processAndSaveImage,
  deleteFileIfExists,
  getUserUploadDir,
  getFilePath,
} = require("./upload.service");

function isLegacyHash(hash) {
  return !hash.startsWith("$2") && !hash.startsWith("$argon");
}

async function verifyPasswordLegacy(currentPassword, storedHash) {
  if (isLegacyHash(storedHash)) {
    const sha256 = crypto.createHash("sha256").update(currentPassword).digest("hex");
    return sha256 === storedHash;
  }
  return bcrypt.compare(currentPassword, storedHash);
}

// ─── Get Current User Profile ───────────────────────────────────────
async function getProfile(userId) {
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
async function updateProfile(userId, data) {
  const user = await prisma.user.findFirst({ where: { uid: userId } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const updateData = {};
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
  updateData.editprofile = new Date().toISOString();

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
async function uploadProfileImage(userId, file) {
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
    data: { uimage: filename, editpropic: new Date().toISOString() },
  });

  return { image: filename, message: "Profile image updated" };
}

// ─── Remove Profile Image ───────────────────────────────────────────
async function removeProfileImage(userId) {
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
    data: { uimage: "", editpropic: new Date().toISOString() },
  });

  return { message: "Profile image removed" };
}

// ─── Upload Company Logo ────────────────────────────────────────────
async function uploadCompanyLogo(userId, file) {
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
    data: { ucompanylogo: filename, editcomlogo: new Date().toISOString() },
  });

  return { logo: filename, message: "Company logo updated" };
}

// ─── Remove Company Logo ────────────────────────────────────────────
async function removeCompanyLogo(userId) {
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
    data: { ucompanylogo: "", editcomlogo: new Date().toISOString() },
  });

  return { message: "Company logo removed" };
}

// ─── Update Social Links ────────────────────────────────────────────
async function updateSocialLinks(userId, data) {
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
      linkpagedate: new Date().toISOString(),
    },
  });

  return { message: "Social links updated" };
}

// ─── Change Password ────────────────────────────────────────────────
async function changePassword(userId, currentPassword, newPassword) {
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
    data: { upass: hashedPassword, udate: new Date().toISOString() },
  });

  return { message: "Password updated successfully" };
}

// ─── Deactivate Account ─────────────────────────────────────────────
async function deactivateAccount(userId) {
  await prisma.$transaction([
    prisma.user.update({
      where: { uid: userId },
      data: { deactivate: 0, uloginvalue: 0, lastseen: new Date().toISOString() },
    }),
  ]);

  return { message: "Account deactivated" };
}

// ─── Activate Account ───────────────────────────────────────────────
async function activateAccount(userId) {
  await prisma.$transaction([
    prisma.user.update({
      where: { uid: userId },
      data: { deactivate: 1, uloginvalue: 1, lastseen: new Date().toISOString() },
    }),
  ]);

  return { message: "Account activated" };
}

// ─── Delete Account ─────────────────────────────────────────────────
async function deleteAccount(userId) {
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
async function blockSelf(userId) {
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
async function unblockSelf(userId) {
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
async function getPublicProfile(userId) {
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

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
  uploadCompanyLogo,
  removeCompanyLogo,
  updateSocialLinks,
  changePassword,
  deactivateAccount,
  activateAccount,
  deleteAccount,
  blockSelf,
  unblockSelf,
  getPublicProfile,
};
