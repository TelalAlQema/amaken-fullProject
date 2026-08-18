import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const UPLOAD_BASE = path.join(__dirname, "../../../public/uploads");

const PROPERTY_UPLOAD_DIR = path.join(UPLOAD_BASE, "properties");
const USER_UPLOAD_DIR = path.join(UPLOAD_BASE, "users");

[PROPERTY_UPLOAD_DIR, USER_UPLOAD_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.memoryStorage();

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed."));
  }
}

export const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("image");

export const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("image");

export async function processAndSaveImage(
  file: Express.Multer.File,
  targetDir: string,
  prefix: string,
  maxWidth = 800,
  maxHeight = 800
): Promise<string> {
  const ext = file.mimetype === "image/png" ? "png" : "webp";
  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filepath = path.join(targetDir, filename);

  await sharp(file.buffer)
    .resize(maxWidth, maxHeight, { fit: "inside", withoutEnlargement: true })
    .toFormat(ext === "png" ? "png" : "webp", { quality: 85 })
    .toFile(filepath);

  return filename;
}

export function deleteFileIfExists(filepath: string): boolean {
  try {
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getUserUploadDir(): string {
  return USER_UPLOAD_DIR;
}

export function getPropertyUploadDir(): string {
  return PROPERTY_UPLOAD_DIR;
}

export function getFilePath(directory: string, filename: string): string {
  return path.join(directory, filename);
}

// ─── Property Image Upload (5 images + 3 floor/map images) ──────────
export const uploadPropertyImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
}).fields([
  { name: "pimage", maxCount: 1 },
  { name: "pimage1", maxCount: 1 },
  { name: "pimage2", maxCount: 1 },
  { name: "pimage3", maxCount: 1 },
  { name: "pimage4", maxCount: 1 },
  { name: "mapimage", maxCount: 1 },
  { name: "topmapimage", maxCount: 1 },
  { name: "groundmapimage", maxCount: 1 },
]);

export const uploadAboutImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

export const uploadTeamImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
