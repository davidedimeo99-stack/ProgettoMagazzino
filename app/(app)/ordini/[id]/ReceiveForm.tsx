"use client";

import { useActionState } from "react";
import { receiveGoods } from "../actions";

type Line = {
  id: string;
  codice: string;
  descrizione: string;
  qtaOrdinata: number;
  qtaRicevuta: number;
};

export default function ReceiveForm({
  orderId,
  lines,
}: {
  orderId: string;
  lines: Line[];
}) {
  const action = receiveGoods.bind(null, orderId);
  const [state, formAction, pending] = useActionState(action, {});

  const open = lines.filter((l) => l.qtaRicevuta < l.qtaOrdinata);
  if (open.length === 0) return null;

  return (
    <form action={formAction} className="bg-white rounded-xl shadow p-4 space-y-3">
      <h2 className="font-semibold">Registra carico (arrivo pedane)</h2>
      <p className="text-sm text-gray-500">
        Inserisci le quantità arrivate. Le righe complete non compaiono più.
      </p>
      <div className="space-y-2">
        {open.map((l) => {
          const residuo = l.qtaOrdinata - l.qtaRicevuta;
          return (
            <div
              key={l.id}
              className="flex items-center gap-3 text-sm border-b pb-2"
            >
              <div className="flex-1">
                <span className="font-mono font-medium">{l.codice}</span> —{" "}
                {l.descrizione}
                <span className="text-gray-400"> (residuo {residuo})</span>
              </div>
              <input
                type="number"
                name={`qta_${l.id}`}
                min={0}
                max={residuo}
                placeholder="0"
                className="w-24 border rounded-lg px-3 py-2"
              />
            </div>
          );
        })}
      </div>
      <input
        name="note"
        placeholder="Note (es. n° DDT, pedana...)"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-600">{state.ok}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-5 py-2.5 font-medium disabled:opacity-50"
      >
        {pending ? "Registrazione..." : "Carica in magazzino"}
      </button>
    </form>
  );
}
