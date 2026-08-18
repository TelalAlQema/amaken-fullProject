import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import {
  processAndSaveImage,
  deleteFileIfExists,
  getPropertyUploadDir,
  getFilePath,
} from "./upload.service";

// ─── Public: Get About Content ──────────────────────────────────────

export async function getAboutContent() {
  return prisma.about.findMany({ orderBy: { id: "desc" } });
}

// ─── Admin: Create About ────────────────────────────────────────────

export async function createAbout(
  data: { title?: string; content: string },
  file?: Express.Multer.File
) {
  let image: string | null = null;

  if (file) {
    const propDir = getPropertyUploadDir();
    image = await processAndSaveImage(file, propDir, "about", 1200, 800);
  }

  return prisma.about.create({
    data: {
      title: data.title || null,
      content: data.content.substring(0, 65000),
      image,
    },
  });
}

// ─── Admin: Update About ────────────────────────────────────────────

export async function updateAbout(
  id: number,
  data: { title?: string; content?: string },
  file?: Express.Multer.File
) {
  const about = await prisma.about.findFirst({ where: { id } });
  if (!about) throw new AppError("About content not found", 404, "ABOUT_NOT_FOUND");

  const updateData: Record<string, any> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content.substring(0, 65000);

  if (file) {
    const propDir = getPropertyUploadDir();
    if (about.image) {
      deleteFileIfExists(getFilePath(propDir, about.image));
    }
    updateData.image = await processAndSaveImage(file, propDir, "about", 1200, 800);
  }

  return prisma.about.update({ where: { id }, data: updateData });
}

// ─── Admin: Delete About ────────────────────────────────────────────

export async function deleteAbout(id: number) {
  const about = await prisma.about.findFirst({ where: { id } });
  if (!about) throw new AppError("About content not found", 404, "ABOUT_NOT_FOUND");

  if (about.image) {
    deleteFileIfExists(getFilePath(getPropertyUploadDir(), about.image));
  }

  await prisma.about.delete({ where: { id } });
  return { message: "About content deleted" };
}
