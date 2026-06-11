"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createSupplier(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const paese = String(formData.get("paese") ?? "Italia").trim() || "Italia";
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!nome) return;

  await db.supplier.upsert({
    where: { nome },
    update: { paese, note },
    create: { nome, paese, note },
  });
  revalidatePath("/fornitori");
}

export async function deleteSupplier(id: string) {
  const usage = await db.supplier.findUnique({
    where: { id },
    include: { _count: { select: { articles: true, orders: true } } },
  });
  if (!usage) return;
  if (usage._count.articles + usage._count.orders > 0) return;
  await db.supplier.delete({ where: { id } });
  revalidatePath("/fornitori");
}
