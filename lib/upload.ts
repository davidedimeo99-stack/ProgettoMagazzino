import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function savePhoto(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return null;

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const name = `${crypto.randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}
