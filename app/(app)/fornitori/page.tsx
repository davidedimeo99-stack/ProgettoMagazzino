import { db } from "@/lib/db";
import { createSupplier, deleteSupplier } from "./actions";

export const dynamic = "force-dynamic";

export default async function FornitoriPage() {
  const suppliers = await db.supplier.findMany({
    include: { _count: { select: { articles: true, orders: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fornitori</h1>

      <form
        action={createSupplier}
        className="bg-white rounded-xl shadow p-4 grid sm:grid-cols-4 gap-3"
      >
        <input
          name="nome"
          required
          placeholder="Nome fornitore *"
          className="border rounded-lg px-3 py-2"
        />
        <input
          name="paese"
          placeholder="Paese (default: Italia)"
          className="border rounded-lg px-3 py-2"
        />
        <input
          name="note"
          placeholder="Note"
          className="border rounded-lg px-3 py-2"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
          + Aggiungi
        </button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Paese</th>
              <th className="px-4 py-3 hidden sm:table-cell">Note</th>
              <th className="px-4 py-3 text-right">Articoli</th>
              <th className="px-4 py-3 text-right">Ordini</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{s.nome}</td>
                <td className="px-4 py-2">{s.paese}</td>
                <td className="px-4 py-2 hidden sm:table-cell text-gray-500">
                  {s.note ?? "—"}
                </td>
                <td className="px-4 py-2 text-right">{s._count.articles}</td>
                <td className="px-4 py-2 text-right">{s._count.orders}</td>
                <td className="px-4 py-2 text-right">
                  {s._count.articles + s._count.orders === 0 && (
                    <form action={deleteSupplier.bind(null, s.id)}>
                      <button className="text-red-600 text-xs hover:underline">
                        Elimina
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Nessun fornitore. Aggiungi il primo qui sopra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
