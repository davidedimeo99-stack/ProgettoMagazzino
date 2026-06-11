# Gestionale Magazzino — Power Group s.r.l.

Web app per la gestione del magazzino: articoli, fornitori, ordini con ricevimenti parziali, distinte base e assemblaggio.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + SQLite (pronto per PostgreSQL in produzione)
- Autenticazione con ruoli (Admin / Operatore)

## Avvio in locale

```bash
npm install
copy .env.example .env   # Windows (su Mac/Linux: cp .env.example .env)
npx prisma db push   # crea il database
npm run db:seed      # crea l'utente admin
npm run dev          # avvia su http://localhost:3000
```

Credenziali iniziali: `admin@powergroup.it` / `admin123` (da cambiare subito).

## Moduli
- **Dashboard** — sottoscorta, ordini in corso, ultimi carichi
- **Articoli** — anagrafica con foto, categoria, fornitore, scorta minima
- **Fornitori** — anagrafica Italia/estero
- **Ordini** — righe ordinato/ricevuto/residuo, carico pedane parziale
- **Distinte** — distinta base per modello slot, calcolo unità assemblabili
- **Assemblaggio** — scarico automatico componenti da distinta
- **Utenti** — gestione multi-admin (solo Admin)

## Roadmap
- Fase 2: carico pedane con foto + AI (lettura QR e quantità)
- Fase 3: report, avvisi sottoscorta, storico movimenti avanzato
