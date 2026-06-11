"use client";

import { useActionState, useState } from "react";
import type { Article } from "@prisma/client";
import { createModel } from "../actions";

type Row = { articleId: string; qta: number };

export default function ModelForm({ articles }: { articles: Article[] }) {
  const [state, formAction, pending] = useActionState(createModel, {});
  const [rows, setRows] = useState<Row[]>([{ articleId: "", qta: 1 }]);

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <form
      action={formAction}
      className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl"
    >
      <input type="hidden" name="items" value={JSON.stringify(rows)} />

      <div>
        <label className="block text-sm font-medium mb-1">
          Nome modello *
        </label>
        <input
          name="nome"
          required
          placeholder="es. Cabinet Slot X500"
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descrizione</label>
        <input
          name="descrizione"
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Foto</label>
        <input type="file" name="foto" accept="image/*" className="w-full text-sm" />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">
          Componenti (quantità per 1 unità)
        </div>
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
              aria-label="Rimuovi componente"
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
          + Aggiungi componente
        </button>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 font-medium disabled:opacity-50"
      >
        {pending ? "Creazione..." : "Crea modello"}
      </button>
    </form>
  );
}
