import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const categorie: Record<string, string> = {
  CARPENTERIA: "Carpenteria",
  PLEX: "Plex",
  LEGNO: "Legno",
  ELETTRONICA: "Elettronica",
  CABLAGGI: "Cablaggi",
  ALTRO: "Altro",
};

export default async function ArticoliPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const articles = await db.article.findMany({
    where: q
      ? {
          OR: [
            { codice: { contains: q } },
            { descrizione: { contains: q } },
          ],
        }
      : undefined,
    include: { supplier: true },
    orderBy: { codice: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Articoli</h1>
        <Link
          href="/articoli/nuovo"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          + Nuovo articolo
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cerca per codice o descrizione..."
          className="flex-1 border rounded-lg px-3 py-2 bg-white"
        />
        <button className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm">
          Cerca
        </button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Codice</th>
              <th className="px-4 py-3">Descrizione</th>
              <th className="px-4 py-3 hidden sm:table-cell">Categoria</th>
              <th className="px-4 py-3 hidden md:table-cell">Fornitore</th>
              <th className="px-4 py-3 text-right">Giacenza</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {a.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.fotoUrl}
                      alt={a.codice}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">
                      —
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 font-mono font-medium">
                  <Link
                    href={`/articoli/${a.id}`}
                    className="text-blue-700 hover:underline"
                  >
                    {a.codice}
                  </Link>
                </td>
                <td className="px-4 py-2">{a.descrizione}</td>
                <td className="px-4 py-2 hidden sm:table-cell">
                  {categorie[a.categoria]}
                </td>
                <td className="px-4 py-2 hidden md:table-cell">
                  {a.supplier?.nome ?? "—"}
                </td>
                <td
                  className={`px-4 py-2 text-right font-medium ${
                    a.scortaMinima > 0 && a.giacenza < a.scortaMinima
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {a.giacenza} {a.unita}
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Nessun articolo trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
