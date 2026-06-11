import { db } from "@/lib/db";
import ModelForm from "./ModelForm";

export const dynamic = "force-dynamic";

export default async function NuovoModelloPage() {
  const articles = await db.article.findMany({ orderBy: { codice: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nuova distinta base</h1>
      {articles.length === 0 ? (
        <p className="text-sm text-gray-500">
          Prima di creare una distinta, aggiungi gli articoli in anagrafica.
        </p>
      ) : (
        <ModelForm articles={articles} />
      )}
    </div>
  );
}
