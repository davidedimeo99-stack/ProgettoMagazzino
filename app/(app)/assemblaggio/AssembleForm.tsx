"use client";

import { useActionState } from "react";
import { assemble } from "./actions";

type ModelOption = { id: string; nome: string; assemblabili: number };

export default function AssembleForm({ models }: { models: ModelOption[] }) {
  const [state, formAction, pending] = useActionState(assemble, {});

  return (
    <form
      action={formAction}
      className="bg-white rounded-xl shadow p-6 space-y-4 max-w-xl"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Modello *</label>
        <select
          name="productModelId"
          required
          className="w-full border rounded-lg px-3 py-2 bg-white"
        >
          <option value="">— Seleziona —</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome} (max {m.assemblabili})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Quantità *</label>
        <input
          type="number"
          name="qta"
          min={1}
          defaultValue={1}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Note</label>
        <input name="note" className="w-full border rounded-lg px-3 py-2" />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-600">{state.ok}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-5 py-2.5 font-medium disabled:opacity-50"
      >
        {pending ? "Registrazione..." : "Registra assemblaggio"}
      </button>
    </form>
  );
}
