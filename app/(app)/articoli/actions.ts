"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { savePhoto } from "@/lib/upload";
import { Categoria } from "@prisma/client";

function parseArticle(formData: FormData) {
  return {
    codice: String(formData.get("codice") ?? "").trim(),
    descrizione: String(formData.get("descrizione") ?? "").trim(),
    categoria: String(formData.get("categoria") ?? "CARPENTERIA") as Categoria,
    unita: String(formData.get("unita") ?? "pz").trim() || "pz",
    scortaMinima: Math.max(0, Number(formData.get("scortaMinima") ?? 0) || 0),
    supplierId: String(formData.get("supplierId") ?? "") || null,
  };
}

export async function createArticle(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const data = parseArticle(formData);
  if (!data.codice || !data.descrizione) {
    return { error: "Codice e descrizione sono obbligatori" };
  }

  const exists = await db.article.findUnique({
    where: { codice: data.codice },
  });
  if (exists) return { error: `Il codice ${data.codice} esiste già` };

  const fotoUrl = await savePhoto(formData.get("foto") as File | null);
  const giacenza = Math.max(0, Number(formData.get("giacenza") ?? 0) || 0);

  await db.article.create({ data: { ...data, fotoUrl, giacenza } });
  revalidatePath("/articoli");
  redirect("/articoli");
}

export async function updateArticle(
  id: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const data = parseArticle(formData);
  if (!data.codice || !data.descrizione) {
    return { error: "Codice e descrizione sono obbligatori" };
  }

  const duplicate = await db.article.findFirst({
    where: { codice: data.codice, NOT: { id } },
  });
  if (duplicate) return { error: `Il codice ${data.codice} esiste già` };

  const fotoUrl = await savePhoto(formData.get("foto") as File | null);

  await db.article.update({
    where: { id },
    data: { ...data, ...(fotoUrl ? { fotoUrl } : {}) },
  });
  revalidatePath("/articoli");
  redirect("/articoli");
}

export async function deleteArticle(id: string) {
  const usage = await db.article.findUnique({
    where: { id },
    include: {
      _count: { select: { orderLines: true, receiptLines: true, bomItems: true } },
    },
  });
  if (!usage) return;
  const { orderLines, receiptLines, bomItems } = usage._count;
  if (orderLines + receiptLines + bomItems > 0) {
    // Articolo usato in ordini/carichi/distinte: non eliminabile per non perdere lo storico
    return;
  }
  await db.article.delete({ where: { id } });
  revalidatePath("/articoli");
}
