import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import {
  processAndSaveImage,
  deleteFileIfExists,
  getPropertyUploadDir,
  getFilePath,
} from "./upload.service";

// ─── Public: Get Team Members ───────────────────────────────────────

export async function getTeamMembers() {
  return prisma.teamMember.findMany({ orderBy: { id: "desc" } });
}

// ─── Admin: Create Team Member ──────────────────────────────────────

export async function createTeamMember(
  data: {
    fname: string;
    lname: string;
    email: string;
    wnumber?: string;
    pnumber?: string;
    about: string;
    type: "leader" | "Team";
    fb?: string;
    ig?: string;
    linkdin?: string;
    tiktok?: string;
    twitter?: string;
    position: string;
  },
  file?: Express.Multer.File
) {
  const existing = await prisma.teamMember.findFirst({ where: { email: data.email } });
  if (existing) {
    throw new AppError("A team member with this email already exists", 409, "EMAIL_EXISTS");
  }

  let image = "";
  if (file) {
    const propDir = getPropertyUploadDir();
    image = await processAndSaveImage(file, propDir, "team", 500, 500);
  }

  return prisma.teamMember.create({
    data: {
      fname: data.fname.substring(0, 255),
      lname: data.lname.substring(0, 255),
      email: data.email.substring(0, 255),
      wnumber: (data.wnumber || "").substring(0, 100),
      pnumber: (data.pnumber || "").substring(0, 100),
      about: data.about.substring(0, 65000),
      type: data.type,
      fb: data.fb || null,
      ig: data.ig || null,
      linkdin: data.linkdin || null,
      tiktok: data.tiktok || null,
      twitter: data.twitter || null,
      image,
      position: data.position.substring(0, 255),
    },
  });
}

// ─── Admin: Update Team Member ──────────────────────────────────────

export async function updateTeamMember(
  id: number,
  data: Partial<{
    fname: string;
    lname: string;
    email: string;
    wnumber: string;
    pnumber: string;
    about: string;
    type: "leader" | "Team";
    fb: string;
    ig: string;
    linkdin: string;
    tiktok: string;
    twitter: string;
    position: string;
  }>,
  file?: Express.Multer.File
) {
  const member = await prisma.teamMember.findFirst({ where: { id } });
  if (!member) throw new AppError("Team member not found", 404, "TEAM_NOT_FOUND");

  const updateData: Record<string, any> = {};
  const stringFields = ["fname", "lname", "email", "wnumber", "pnumber", "about", "type", "fb", "ig", "linkdin", "tiktok", "twitter", "position"] as const;

  for (const field of stringFields) {
    if (data[field] !== undefined) {
      updateData[field] = field === "about" ? String(data[field]).substring(0, 65000) : String(data[field]).substring(0, 255);
    }
  }

  if (file) {
    const propDir = getPropertyUploadDir();
    if (member.image) {
      deleteFileIfExists(getFilePath(propDir, member.image));
    }
    updateData.image = await processAndSaveImage(file, propDir, "team", 500, 500);
  }

  return prisma.teamMember.update({ where: { id }, data: updateData });
}

// ─── Admin: Delete Team Member ──────────────────────────────────────

export async function deleteTeamMember(id: number) {
  const member = await prisma.teamMember.findFirst({ where: { id } });
  if (!member) throw new AppError("Team member not found", 404, "TEAM_NOT_FOUND");

  if (member.image) {
    deleteFileIfExists(getFilePath(getPropertyUploadDir(), member.image));
  }

  await prisma.teamMember.delete({ where: { id } });
  return { message: "Team member deleted" };
}
