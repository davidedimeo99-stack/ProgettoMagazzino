import { db } from "@/lib/db";
import OrderForm from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function NuovoOrdinePage() {
  const [suppliers, articles] = await Promise.all([
    db.supplier.findMany({ orderBy: { nome: "asc" } }),
    db.article.findMany({ orderBy: { codice: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nuovo ordine</h1>
      {articles.length === 0 ? (
        <p className="text-sm text-gray-500">
          Prima di creare un ordine, aggiungi gli articoli in anagrafica.
        </p>
      ) : (
        <OrderForm suppliers={suppliers} articles={articles} />
      )}
    </div>
  );
}
