import { db } from "@/lib/db";
import AssembleForm from "./AssembleForm";

export const dynamic = "force-dynamic";

export default async function AssemblaggioPage() {
  const [models, assemblies] = await Promise.all([
    db.productModel.findMany({
      include: { items: { include: { article: true } } },
      orderBy: { nome: "asc" },
    }),
    db.assembly.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { productModel: true, user: true },
    }),
  ]);

  const options = models
    .filter((m) => m.items.length > 0)
    .map((m) => ({
      id: m.id,
      nome: m.nome,
      assemblabili: Math.min(
        ...m.items.map((i) => Math.floor(i.article.giacenza / i.qta)),
      ),
    }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assemblaggio</h1>
      <p className="text-sm text-gray-500">
        Registrando un assemblaggio, i componenti della distinta base vengono
        scaricati automaticamente dal magazzino.
      </p>

      {options.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nessun modello con distinta base. Creane uno nella sezione Distinte.
        </p>
      ) : (
        <AssembleForm models={options} />
      )}

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Ultimi assemblaggi</h2>
        {assemblies.length === 0 ? (
          <p className="text-sm text-gray-500">Nessun assemblaggio.</p>
        ) : (
          <ul className="divide-y text-sm">
            {assemblies.map((a) => (
              <li key={a.id} className="py-2 flex justify-between">
                <span>
                  <strong>{a.productModel.nome}</strong> ×{a.qta}
                  {a.note ? ` — ${a.note}` : ""}
                </span>
                <span className="text-gray-500">
                  {new Date(a.createdAt).toLocaleString("it-IT")}
                  {a.user ? ` — ${a.user.nome}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
