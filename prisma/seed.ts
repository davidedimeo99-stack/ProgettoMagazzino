import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);
  await db.user.upsert({
    where: { email: "admin@powergroup.it" },
    update: {},
    create: {
      email: "admin@powergroup.it",
      password,
      nome: "Amministratore",
      role: "ADMIN",
    },
  });
  console.log("Utente admin creato: admin@powergroup.it / admin123");
}

main().finally(() => db.$disconnect());
