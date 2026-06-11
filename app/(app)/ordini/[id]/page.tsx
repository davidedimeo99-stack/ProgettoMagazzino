import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ReceiveForm from "./ReceiveForm";

export const dynamic = "force-dynamic";

export default async function OrdinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      supplier: true,
      lines: { include: { article: true } },
      receipts: {
        include: { lines: { include: { article: true } }, user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ordine {order.numero}</h1>
        <p className="text-sm text-gray-500">
          {order.supplier.nome} —{" "}
          {new Date(order.createdAt).toLocaleDateString("it-IT")} — Stato:{" "}
          <strong>{order.stato}</strong>
          {order.note ? ` — ${order.note}` : ""}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Codice</th>
              <th className="px-4 py-3">Descrizione</th>
              <th className="px-4 py-3 text-right">Ordinato</th>
              <th className="px-4 py-3 text-right">Ricevuto</th>
              <th className="px-4 py-3 text-right">Residuo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.lines.map((l) => {
              const residuo = l.qtaOrdinata - l.qtaRicevuta;
              return (
                <tr key={l.id}>
                  <td className="px-4 py-2 font-mono font-medium">
                    {l.article.codice}
                  </td>
                  <td className="px-4 py-2">{l.article.descrizione}</td>
                  <td className="px-4 py-2 text-right">{l.qtaOrdinata}</td>
                  <td className="px-4 py-2 text-right">{l.qtaRicevuta}</td>
                  <td
                    className={`px-4 py-2 text-right font-medium ${
                      residuo > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {residuo}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ReceiveForm
        orderId={order.id}
        lines={order.lines.map((l) => ({
          id: l.id,
          codice: l.article.codice,
          descrizione: l.article.descrizione,
          qtaOrdinata: l.qtaOrdinata,
          qtaRicevuta: l.qtaRicevuta,
        }))}
      />

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Storico carichi</h2>
        {order.receipts.length === 0 ? (
          <p className="text-sm text-gray-500">Nessun carico registrato.</p>
        ) : (
          <ul className="divide-y text-sm">
            {order.receipts.map((r) => (
              <li key={r.id} className="py-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {new Date(r.createdAt).toLocaleString("it-IT")}
                    {r.user ? ` — ${r.user.nome}` : ""}
                    {r.note ? ` — ${r.note}` : ""}
                  </span>
                </div>
                <div>
                  {r.lines
                    .map((l) => `${l.article.codice} ×${l.qta}`)
                    .join(", ")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
