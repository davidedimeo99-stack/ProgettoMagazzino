import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { deleteUser } from "./actions";
import UserForm from "./UserForm";

export const dynamic = "force-dynamic";

export default async function UtentiPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  const nAdmins = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Utenti</h1>
      <UserForm />
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Ruolo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => {
              const removable =
                u.id !== session.userId &&
                !(u.role === "ADMIN" && nAdmins <= 1);
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{u.nome}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {u.role === "ADMIN" ? "Admin" : "Operatore"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {removable && (
                      <form action={deleteUser.bind(null, u.id)}>
                        <button className="text-red-600 text-xs hover:underline">
                          Elimina
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
