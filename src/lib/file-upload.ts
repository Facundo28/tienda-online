import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function saveUploadedFile(file: File, folder: string = "misc") {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Formato de imagen no permitido (usa JPG/PNG/WebP)");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("La imagen es demasiado grande (máx 10MB)");
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}
