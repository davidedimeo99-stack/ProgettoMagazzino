"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { savePhoto } from "@/lib/upload";

export async function createModel(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const nome = String(formData.get("nome") ?? "").trim();
  const descrizione =
    String(formData.get("descrizione") ?? "").trim() || null;
  const itemsRaw = String(formData.get("items") ?? "[]");

  let items: { articleId: string; qta: number }[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { error: "Componenti non validi" };
  }
  items = items.filter((i) => i.articleId && i.qta > 0);

  if (!nome) return { error: "Nome modello obbligatorio" };
  if (items.length === 0) return { error: "Aggiungi almeno un componente" };

  const seen = new Set<string>();
  for (const i of items) {
    if (seen.has(i.articleId)) {
      return { error: "Componente duplicato nella distinta" };
    }
    seen.add(i.articleId);
  }

  const exists = await db.productModel.findUnique({ where: { nome } });
  if (exists) return { error: `Il modello ${nome} esiste già` };

  const fotoUrl = await savePhoto(formData.get("foto") as File | null);

  const model = await db.productModel.create({
    data: {
      nome,
      descrizione,
      fotoUrl,
      items: { create: items },
    },
  });

  revalidatePath("/distinte");
  redirect(`/distinte/${model.id}`);
}

export async function deleteModel(id: string) {
  const usage = await db.productModel.findUnique({
    where: { id },
    include: { _count: { select: { assemblies: true } } },
  });
  if (!usage || usage._count.assemblies > 0) return;
  await db.productModel.delete({ where: { id } });
  revalidatePath("/distinte");
}
