"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function createOrder(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const numero = String(formData.get("numero") ?? "").trim();
  const supplierId = String(formData.get("supplierId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const linesRaw = String(formData.get("lines") ?? "[]");

  let lines: { articleId: string; qta: number }[];
  try {
    lines = JSON.parse(linesRaw);
  } catch {
    return { error: "Righe ordine non valide" };
  }
  lines = lines.filter((l) => l.articleId && l.qta > 0);

  if (!numero) return { error: "Numero ordine obbligatorio" };
  if (!supplierId) return { error: "Seleziona un fornitore" };
  if (lines.length === 0) return { error: "Aggiungi almeno una riga" };

  const exists = await db.order.findUnique({ where: { numero } });
  if (exists) return { error: `L'ordine ${numero} esiste già` };

  const order = await db.order.create({
    data: {
      numero,
      supplierId,
      note,
      lines: {
        create: lines.map((l) => ({
          articleId: l.articleId,
          qtaOrdinata: l.qta,
        })),
      },
    },
  });

  revalidatePath("/ordini");
  redirect(`/ordini/${order.id}`);
}

export async function receiveGoods(
  orderId: string,
  _prev: { error?: string; ok?: string },
  formData: FormData,
): Promise<{ error?: string; ok?: string }> {
  const session = await getSession();
  const note = String(formData.get("note") ?? "").trim() || null;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { lines: true },
  });
  if (!order) return { error: "Ordine non trovato" };

  const toReceive: { lineId: string; articleId: string; qta: number }[] = [];
  for (const line of order.lines) {
    const qta = Number(formData.get(`qta_${line.id}`) ?? 0) || 0;
    if (qta <= 0) continue;
    const residuo = line.qtaOrdinata - line.qtaRicevuta;
    if (qta > residuo) {
      return {
        error: `Quantità superiore al residuo (${residuo}) per una riga`,
      };
    }
    toReceive.push({ lineId: line.id, articleId: line.articleId, qta });
  }

  if (toReceive.length === 0) {
    return { error: "Inserisci almeno una quantità da caricare" };
  }

  await db.$transaction(async (tx) => {
    await tx.receipt.create({
      data: {
        orderId,
        userId: session?.userId ?? null,
        note,
        lines: {
          create: toReceive.map((r) => ({
            articleId: r.articleId,
            qta: r.qta,
          })),
        },
      },
    });

    for (const r of toReceive) {
      await tx.orderLine.update({
        where: { id: r.lineId },
        data: { qtaRicevuta: { increment: r.qta } },
      });
      await tx.article.update({
        where: { id: r.articleId },
        data: { giacenza: { increment: r.qta } },
      });
    }

    const updated = await tx.orderLine.findMany({ where: { orderId } });
    const complete = updated.every((l) => l.qtaRicevuta >= l.qtaOrdinata);
    const any = updated.some((l) => l.qtaRicevuta > 0);
    await tx.order.update({
      where: { id: orderId },
      data: { stato: complete ? "COMPLETATO" : any ? "PARZIALE" : "APERTO" },
    });
  });

  revalidatePath(`/ordini/${orderId}`);
  revalidatePath("/ordini");
  revalidatePath("/articoli");
  revalidatePath("/dashboard");
  return { ok: "Carico registrato" };
}
