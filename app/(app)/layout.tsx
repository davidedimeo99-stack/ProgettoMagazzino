import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/login/actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/articoli", label: "Articoli" },
  { href: "/fornitori", label: "Fornitori" },
  { href: "/ordini", label: "Ordini" },
  { href: "/distinte", label: "Distinte" },
  { href: "/assemblaggio", label: "Assemblaggio" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="font-bold whitespace-nowrap">
            Power Group
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-blue-100">
              {session.nome} ({session.role === "ADMIN" ? "Admin" : "Operatore"})
            </span>
            <form action={logout}>
              <button className="bg-blue-800 hover:bg-blue-900 rounded px-3 py-1.5">
                Esci
              </button>
            </form>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap hover:bg-blue-600"
            >
              {item.label}
            </Link>
          ))}
          {session.role === "ADMIN" && (
            <Link
              href="/utenti"
              className="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap hover:bg-blue-600"
            >
              Utenti
            </Link>
          )}
        </nav>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
