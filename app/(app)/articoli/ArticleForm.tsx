"use client";

import { useActionState } from "react";
import type { Article, Supplier } from "@prisma/client";

type Props = {
  suppliers: Supplier[];
  article?: Article;
  action: (
    prev: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>;
};

export default function ArticleForm({ suppliers, article, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="bg-white rounded-xl shadow p-6 space-y-4 max-w-xl"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Codice *</label>
          <input
            name="codice"
            required
            defaultValue={article?.codice}
            className="w-full border rounded-lg px-3 py-2 font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <select
            name="categoria"
            defaultValue={article?.categoria ?? "CARPENTERIA"}
            className="w-full border rounded-lg px-3 py-2 bg-white"
          >
            <option value="CARPENTERIA">Carpenteria</option>
            <option value="PLEX">Plex</option>
            <option value="LEGNO">Legno</option>
            <option value="ELETTRONICA">Elettronica</option>
            <option value="CABLAGGI">Cablaggi</option>
            <option value="ALTRO">Altro</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrizione *</label>
        <input
          name="descrizione"
          required
          defaultValue={article?.descrizione}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Unità</label>
          <input
            name="unita"
            defaultValue={article?.unita ?? "pz"}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Scorta minima
          </label>
          <input
            type="number"
            name="scortaMinima"
            min={0}
            defaultValue={article?.scortaMinima ?? 0}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        {!article && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Giacenza iniziale
            </label>
            <input
              type="number"
              name="giacenza"
              min={0}
              defaultValue={0}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fornitore</label>
        <select
          name="supplierId"
          defaultValue={article?.supplierId ?? ""}
          className="w-full border rounded-lg px-3 py-2 bg-white"
        >
          <option value="">— Nessuno —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Foto {article?.fotoUrl ? "(carica per sostituire)" : ""}
        </label>
        <input
          type="file"
          name="foto"
          accept="image/*"
          capture="environment"
          className="w-full text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 font-medium disabled:opacity-50"
      >
        {pending ? "Salvataggio..." : "Salva"}
      </button>
    </form>
  );
}
