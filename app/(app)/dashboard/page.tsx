import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [nArticoli, nFornitori, ordiniAperti, sottoscorta, ultimiCarichi] =
    await Promise.all([
      db.article.count(),
      db.supplier.count(),
      db.order.findMany({
        where: { stato: { in: ["APERTO", "PARZIALE"] } },
        include: { supplier: true, lines: true },
        orderBy: { createdAt: "desc" },
      }),
      db.article.findMany({
        where: { scortaMinima: { gt: 0 } },
        orderBy: { codice: "asc" },
      }),
      db.receipt.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { order: true, lines: { include: { article: true } } },
      }),
    ]);

  const articoliSottoscorta = sottoscorta.filter(
    (a) => a.giacenza < a.scortaMinima,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card label="Articoli" value={nArticoli} href="/articoli" />
        <Card label="Fornitori" value={nFornitori} href="/fornitori" />
        <Card label="Ordini aperti" value={ordiniAperti.length} href="/ordini" />
        <Card
          label="Sottoscorta"
          value={articoliSottoscorta.length}
          href="/articoli"
          alert={articoliSottoscorta.length > 0}
        />
      </div>

      {articoliSottoscorta.length > 0 && (
        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3 text-red-700">
            Articoli sottoscorta
          </h2>
          <ul className="divide-y text-sm">
            {articoliSottoscorta.map((a) => (
              <li key={a.id} className="py-2 flex justify-between">
                <span>
                  <span className="font-mono font-medium">{a.codice}</span>{" "}
                  — {a.descrizione}
                </span>
                <span className="text-red-600 font-medium">
                  {a.giacenza} / min {a.scortaMinima}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Ordini in corso</h2>
        {ordiniAperti.length === 0 ? (
          <p className="text-sm text-gray-500">Nessun ordine aperto.</p>
        ) : (
          <ul className="divide-y text-sm">
            {ordiniAperti.map((o) => {
              const ordinato = o.lines.reduce((s, l) => s + l.qtaOrdinata, 0);
              const ricevuto = o.lines.reduce((s, l) => s + l.qtaRicevuta, 0);
              return (
                <li key={o.id} className="py-2">
                  <Link
                    href={`/ordini/${o.id}`}
                    className="flex justify-between hover:text-blue-700"
                  >
                    <span>
                      <span className="font-medium">{o.numero}</span> —{" "}
                      {o.supplier.nome}
                    </span>
                    <span className="text-gray-500">
                      {ricevuto}/{ordinato} pz ricevuti
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Ultimi carichi</h2>
        {ultimiCarichi.length === 0 ? (
          <p className="text-sm text-gray-500">Nessun carico registrato.</p>
        ) : (
          <ul className="divide-y text-sm">
            {ultimiCarichi.map((r) => (
              <li key={r.id} className="py-2">
                <div className="flex justify-between">
                  <span>
                    {r.order ? `Ordine ${r.order.numero}` : "Carico libero"}
                  </span>
                  <span className="text-gray-500">
                    {new Date(r.createdAt).toLocaleString("it-IT")}
                  </span>
                </div>
                <div className="text-gray-500">
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

function Card({
  label,
  value,
  href,
  alert,
}: {
  label: string;
  value: number;
  href: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`bg-white rounded-xl shadow p-4 hover:shadow-md ${
        alert ? "border-2 border-red-400" : ""
      }`}
    >
      <div className="text-3xl font-bold">{value}</div>
      <div className={`text-sm ${alert ? "text-red-600" : "text-gray-500"}`}>
        {label}
      </div>
    </Link>
  );
}
