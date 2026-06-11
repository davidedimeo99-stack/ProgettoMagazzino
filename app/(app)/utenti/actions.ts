"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Operazione riservata agli amministratori");
  }
  return session;
}

export async function createUser(
  _prev: { error?: string; ok?: string },
  formData: FormData,
): Promise<{ error?: string; ok?: string }> {
  await requireAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "OPERATORE";

  if (!nome || !email || password.length < 6) {
    return { error: "Compila tutti i campi (password min. 6 caratteri)" };
  }

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return { error: "Email già registrata" };

  await db.user.create({
    data: { nome, email, password: await bcrypt.hash(password, 10), role },
  });
  revalidatePath("/utenti");
  return { ok: `Utente ${nome} creato` };
}

export async function deleteUser(id: string) {
  const session = await requireAdmin();
  if (id === session.userId) return; // non puoi eliminare te stesso

  const admins = await db.user.count({ where: { role: "ADMIN" } });
  const target = await db.user.findUnique({ where: { id } });
  if (!target) return;
  if (target.role === "ADMIN" && admins <= 1) return; // mai zero admin

  await db.user.delete({ where: { id } });
  revalidatePath("/utenti");
}
