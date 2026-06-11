"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function assemble(
  _prev: { error?: string; ok?: string },
  formData: FormData,
): Promise<{ error?: string; ok?: string }> {
  const session = await getSession();
  const productModelId = String(formData.get("productModelId") ?? "");
  const qta = Number(formData.get("qta") ?? 0) || 0;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!productModelId) return { error: "Seleziona un modello" };
  if (qta <= 0) return { error: "Quantità non valida" };

  const model = await db.productModel.findUnique({
    where: { id: productModelId },
    include: { items: { include: { article: true } } },
  });
  if (!model) return { error: "Modello non trovato" };
  if (model.items.length === 0)
    return { error: "La distinta base è vuota" };

  const mancanti = model.items.filter(
    (i) => i.article.giacenza < i.qta * qta,
  );
  if (mancanti.length > 0) {
    const elenco = mancanti
      .map(
        (i) =>
          `${i.article.codice} (servono ${i.qta * qta}, disponibili ${i.article.giacenza})`,
      )
      .join("; ");
    return { error: `Componenti insufficienti: ${elenco}` };
  }

  await db.$transaction(async (tx) => {
    for (const i of model.items) {
      await tx.article.update({
        where: { id: i.articleId },
        data: { giacenza: { decrement: i.qta * qta } },
      });
    }
    await tx.assembly.create({
      data: {
        productModelId,
        qta,
        note,
        userId: session?.userId ?? null,
      },
    });
  });

  revalidatePath("/assemblaggio");
  revalidatePath("/articoli");
  revalidatePath("/distinte");
  revalidatePath("/dashboard");
  return { ok: `Assemblate ${qta} unità di ${model.nome}, componenti scaricati` };
}
