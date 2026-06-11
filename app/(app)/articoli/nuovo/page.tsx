import { db } from "@/lib/db";
import ArticleForm from "../ArticleForm";
import { createArticle } from "../actions";

export const dynamic = "force-dynamic";

export default async function NuovoArticoloPage() {
  const suppliers = await db.supplier.findMany({ orderBy: { nome: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nuovo articolo</h1>
      <ArticleForm suppliers={suppliers} action={createArticle} />
    </div>
  );
}
