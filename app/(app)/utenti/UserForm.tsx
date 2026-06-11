"use client";

import { useActionState } from "react";
import { createUser } from "./actions";

export default function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, {});

  return (
    <form
      action={formAction}
      className="bg-white rounded-xl shadow p-4 grid sm:grid-cols-5 gap-3"
    >
      <input
        name="nome"
        required
        placeholder="Nome *"
        className="border rounded-lg px-3 py-2"
      />
      <input
        type="email"
        name="email"
        required
        placeholder="Email *"
        className="border rounded-lg px-3 py-2"
      />
      <input
        type="password"
        name="password"
        required
        minLength={6}
        placeholder="Password *"
        className="border rounded-lg px-3 py-2"
      />
      <select name="role" className="border rounded-lg px-3 py-2 bg-white">
        <option value="OPERATORE">Operatore</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        + Crea utente
      </button>
      {state.error && (
        <p className="text-sm text-red-600 sm:col-span-5">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-green-600 sm:col-span-5">{state.ok}</p>
      )}
    </form>
  );
}
