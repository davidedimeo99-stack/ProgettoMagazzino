"use client";

import { useActionState, useState } from "react";
import type { Article, Supplier } from "@prisma/client";
import { createOrder } from "../actions";

type Row = { articleId: string; qta: number };

export default function OrderForm({
  suppliers,
  articles,
}: {
  suppliers: Supplier[];
  articles: Article[];
}) {
  const [state, formAction, pending] = useActionState(createOrder, {});
  const [rows, setRows] = useState<Row[]>([{ articleId: "", qta: 1 }]);

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <form
      action={formAction}
      className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl"
    >
      <input type="hidden" name="lines" value={JSON.stringify(rows)} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Numero ordine *
          </label>
          <input
            name="numero"
            required
            placeholder="es. ORD-2026-001"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fornitore *</label>
          <select
            name="supplierId"
            required
            className="w-full border rounded-lg px-3 py-2 bg-white"
          >
            <option value="">— Seleziona —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Note</label>
        <input name="note" className="w-full border rounded-lg px-3 py-2" />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Righe ordine</div>
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select
              value={row.articleId}
              onChange={(e) => setRow(i, { articleId: e.target.value })}
              className="flex-1 border rounded-lg px-3 py-2 bg-white text-sm"
            >
              <option value="">— Articolo —</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.codice} — {a.descrizione}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={row.qta}
              onChange={(e) =>
                setRow(i, { qta: Math.max(1, Number(e.target.value) || 1) })
              }
              className="w-24 border rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
              disabled={rows.length === 1}
              className="text-red-500 disabled:opacity-30 px-2"
              aria-label="Rimuovi riga"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { articleId: "", qta: 1 }])}
          className="text-sm text-blue-700 hover:underline"
        >
          + Aggiungi riga
        </button>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 font-medium disabled:opacity-50"
      >
        {pending ? "Creazione..." : "Crea ordine"}
      </button>
    </form>
  );
}
