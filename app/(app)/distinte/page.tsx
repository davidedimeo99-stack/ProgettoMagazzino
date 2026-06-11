import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DistintePage() {
  const models = await db.productModel.findMany({
    include: { items: { include: { article: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Distinte base (modelli slot)</h1>
        <Link
          href="/distinte/nuovo"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          + Nuovo modello
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((m) => {
          const assemblabili = Math.min(
            ...m.items.map((i) => Math.floor(i.article.giacenza / i.qta)),
          );
          return (
            <Link
              key={m.id}
              href={`/distinte/${m.id}`}
              className="bg-white rounded-xl shadow p-4 hover:shadow-md space-y-2"
            >
              {m.fotoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.fotoUrl}
                  alt={m.nome}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <div className="font-semibold">{m.nome}</div>
              {m.descrizione && (
                <div className="text-sm text-gray-500">{m.descrizione}</div>
              )}
              <div className="text-sm">
                {m.items.length} componenti —{" "}
                <span
                  className={
                    assemblabili > 0
                      ? "text-green-700 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {assemblabili} assemblabili
                </span>
              </div>
            </Link>
          );
        })}
        {models.length === 0 && (
          <p className="text-gray-400 col-span-full py-8 text-center">
            Nessun modello. Crea la prima distinta base.
          </p>
        )}
      </div>
    </div>
  );
}
