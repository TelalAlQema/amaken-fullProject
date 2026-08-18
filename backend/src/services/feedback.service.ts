import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

// ─── Create Feedback ────────────────────────────────────────────────

export async function createFeedback(
  senderEmail: string,
  receiverEmail: string,
  data: { description: string; rating?: number }
) {
  const sender = await prisma.user.findFirst({ where: { uemail: senderEmail } });
  if (!sender) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  // Check if receiver is admin or user
  const admin = await prisma.admin.findFirst({ where: { aemail: receiverEmail } });
  const receiverUser = await prisma.user.findFirst({ where: { uemail: receiverEmail } });

  if (!admin && !receiverUser) {
    throw new AppError("Receiver not found", 404, "RECEIVER_NOT_FOUND");
  }

  return prisma.feedback.create({
    data: {
      uid: sender.uid,
      agid: admin?.aid || null,
      fdescription: data.description.substring(0, 65000),
      rating: data.rating || 0,
      send_email: senderEmail,
      receive_email: receiverEmail,
      fblock: 1,
      fdeactivate: 1,
      fadminblock: 0,
    },
  });
}

// ─── Get My Feedback (sent by me) ──────────────────────────────────

export async function getMyFeedback(userId: number, page = 1, limit = 50) {
  const where = { uid: userId };

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        admin: { select: { aid: true, aname: true, alname: true, aemail: true, aimage: true } },
        user: { select: { uid: true, uname: true, lname: true, uemail: true, uimage: true } },
      },
    }),
    prisma.feedback.count({ where }),
  ]);

  return {
    feedbacks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Get Feedback About Me ──────────────────────────────────────────

export async function getFeedbackAboutMe(email: string, page = 1, limit = 50) {
  const where = { receive_email: email };

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        admin: { select: { aid: true, aname: true, alname: true, aemail: true, aimage: true } },
        user: { select: { uid: true, uname: true, lname: true, uemail: true, uimage: true } },
      },
    }),
    prisma.feedback.count({ where }),
  ]);

  return {
    feedbacks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Get Single Feedback ────────────────────────────────────────────

export async function getFeedbackById(fid: number) {
  const feedback = await prisma.feedback.findFirst({
    where: { fid },
    include: {
      admin: { select: { aid: true, aname: true, alname: true, aemail: true, aimage: true } },
      user: { select: { uid: true, uname: true, lname: true, uemail: true, uimage: true } },
    },
  });

  if (!feedback) throw new AppError("Feedback not found", 404, "FEEDBACK_NOT_FOUND");
  return feedback;
}

// ─── Update Feedback ────────────────────────────────────────────────

export async function updateFeedback(fid: number, userId: number, data: { description?: string; rating?: number }) {
  const feedback = await prisma.feedback.findFirst({ where: { fid } });
  if (!feedback) throw new AppError("Feedback not found", 404, "FEEDBACK_NOT_FOUND");
  if (feedback.uid !== userId) throw new AppError("Not authorized", 403, "FORBIDDEN");

  const updateData: Record<string, any> = {};
  if (data.description !== undefined) updateData.fdescription = data.description.substring(0, 65000);
  if (data.rating !== undefined) updateData.rating = data.rating;

  return prisma.feedback.update({
    where: { fid },
    data: updateData,
  });
}

// ─── Delete Feedback ────────────────────────────────────────────────

export async function deleteFeedback(fid: number, userId?: number) {
  const feedback = await prisma.feedback.findFirst({ where: { fid } });
  if (!feedback) throw new AppError("Feedback not found", 404, "FEEDBACK_NOT_FOUND");
  if (userId && feedback.uid !== userId) throw new AppError("Not authorized", 403, "FORBIDDEN");

  await prisma.feedback.delete({ where: { fid } });
  return { message: "Feedback deleted" };
}

// ─── Admin: Company Feedback (by receive_email) ─────────────────────

export async function getCompanyFeedback(email: string, page = 1, limit = 50) {
  const where = { receive_email: email };

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        admin: { select: { aid: true, aname: true, alname: true, aemail: true } },
        user: { select: { uid: true, uname: true, lname: true, uemail: true } },
      },
    }),
    prisma.feedback.count({ where }),
  ]);

  return {
    feedbacks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Admin: Agent Feedback (feedbacks where sender is agent) ────────

export async function getAgentFeedback(page = 1, limit = 50) {
  const where = {
    user: { utype: "Agent" as const },
  };

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        admin: { select: { aid: true, aname: true, alname: true, aemail: true } },
        user: { select: { uid: true, uname: true, lname: true, uemail: true } },
      },
    }),
    prisma.feedback.count({ where }),
  ]);

  return {
    feedbacks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
