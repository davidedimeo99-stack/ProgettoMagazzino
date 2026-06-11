"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        action={action}
        className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Magazzino Power Group
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Accedi con le tue credenziali
        </p>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full border rounded-lg px-3 py-2"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            className="w-full border rounded-lg px-3 py-2"
            autoComplete="current-password"
          />
        </div>
        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 disabled:opacity-50"
        >
          {pending ? "Accesso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
