import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ArticleForm from "../ArticleForm";
import { updateArticle, deleteArticle } from "../actions";

export const dynamic = "force-dynamic";

export default async function ModificaArticoloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, suppliers] = await Promise.all([
    db.article.findUnique({ where: { id } }),
    db.supplier.findMany({ orderBy: { nome: "asc" } }),
  ]);
  if (!article) notFound();

  const update = updateArticle.bind(null, id);
  const remove = deleteArticle.bind(null, id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Articolo <span className="font-mono">{article.codice}</span>
        </h1>
        <form action={remove}>
          <button className="text-sm text-red-600 hover:underline">
            Elimina
          </button>
        </form>
      </div>
      {article.fotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.fotoUrl}
          alt={article.codice}
          className="w-32 h-32 object-cover rounded-xl shadow"
        />
      )}
      <p className="text-sm text-gray-500">
        Giacenza attuale: <strong>{article.giacenza} {article.unita}</strong>{" "}
        (si aggiorna con carichi e assemblaggi)
      </p>
      <ArticleForm suppliers={suppliers} article={article} action={update} />
    </div>
  );
}
