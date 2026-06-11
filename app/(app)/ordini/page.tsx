import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const statoBadge: Record<string, string> = {
  APERTO: "bg-yellow-100 text-yellow-800",
  PARZIALE: "bg-blue-100 text-blue-800",
  COMPLETATO: "bg-green-100 text-green-800",
  ANNULLATO: "bg-gray-100 text-gray-500",
};

export default async function OrdiniPage() {
  const orders = await db.order.findMany({
    include: { supplier: true, lines: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ordini fornitore</h1>
        <Link
          href="/ordini/nuovo"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          + Nuovo ordine
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Numero</th>
              <th className="px-4 py-3">Fornitore</th>
              <th className="px-4 py-3 hidden sm:table-cell">Data</th>
              <th className="px-4 py-3 text-right">Ricevuto</th>
              <th className="px-4 py-3">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => {
              const ordinato = o.lines.reduce((s, l) => s + l.qtaOrdinata, 0);
              const ricevuto = o.lines.reduce((s, l) => s + l.qtaRicevuta, 0);
              return (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">
                    <Link
                      href={`/ordini/${o.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {o.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{o.supplier.nome}</td>
                  <td className="px-4 py-2 hidden sm:table-cell">
                    {new Date(o.createdAt).toLocaleDateString("it-IT")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {ricevuto}/{ordinato}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statoBadge[o.stato]}`}
                    >
                      {o.stato}
                    </span>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nessun ordine. Crea il primo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
