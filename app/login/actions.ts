"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export async function login(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Email o password non validi" };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    nome: user.nome,
    role: user.role,
  });
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
