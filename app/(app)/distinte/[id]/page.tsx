import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteModel } from "../actions";

export const dynamic = "force-dynamic";

export default async function ModelloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = await db.productModel.findUnique({
    where: { id },
    include: {
      items: { include: { article: true } },
      _count: { select: { assemblies: true } },
    },
  });
  if (!model) notFound();

  const assemblabili = Math.min(
    ...model.items.map((i) => Math.floor(i.article.giacenza / i.qta)),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{model.nome}</h1>
        {model._count.assemblies === 0 && (
          <form action={deleteModel.bind(null, model.id)}>
            <button className="text-sm text-red-600 hover:underline">
              Elimina
            </button>
          </form>
        )}
      </div>
      {model.descrizione && (
        <p className="text-gray-500">{model.descrizione}</p>
      )}
      {model.fotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={model.fotoUrl}
          alt={model.nome}
          className="w-48 h-48 object-cover rounded-xl shadow"
        />
      )}

      <p
        className={`font-medium ${
          assemblabili > 0 ? "text-green-700" : "text-red-600"
        }`}
      >
        Con la giacenza attuale puoi assemblare {assemblabili} unità.
      </p>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Codice</th>
              <th className="px-4 py-3">Descrizione</th>
              <th className="px-4 py-3 text-right">Qtà per unità</th>
              <th className="px-4 py-3 text-right">Giacenza</th>
              <th className="px-4 py-3 text-right">Unità copribili</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {model.items.map((i) => {
              const copribili = Math.floor(i.article.giacenza / i.qta);
              return (
                <tr
                  key={i.id}
                  className={copribili === 0 ? "bg-red-50" : undefined}
                >
                  <td className="px-4 py-2 font-mono font-medium">
                    {i.article.codice}
                  </td>
                  <td className="px-4 py-2">{i.article.descrizione}</td>
                  <td className="px-4 py-2 text-right">{i.qta}</td>
                  <td className="px-4 py-2 text-right">
                    {i.article.giacenza}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-medium ${
                      copribili === 0 ? "text-red-600" : ""
                    }`}
                  >
                    {copribili}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
