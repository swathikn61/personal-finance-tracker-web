# Spend Journal – Frontend

Spend Journal is a personal income and expense tracker. This is its React + TypeScript + Vite + Tailwind + shadcn/ui frontend for the Express backend.

## Run

1. Start the backend (Postgres + Redis + `npm run dev`) so it listens on `http://localhost:3000`.
2. In this folder:

```bash
npm install
npm run dev
```

Open http://localhost:5173. In dev, Vite proxies `/api/*` to `http://localhost:3000`, so the backend doesn't need CORS.

To point at a different backend in production, set `VITE_API_URL` (e.g. `https://api.example.com/api/v1`) — the backend will then need CORS enabled.

## Structure

- `src/lib/api.ts` – API client (JWT storage, auto refresh on 401, CSV download)
- `src/lib/auth.tsx` – auth context
- `src/pages/AuthPage.tsx` – login / register
- `src/pages/Dashboard.tsx` – summary cards, filters, sortable/paginated entries table, export
- `src/components/EntryFormDialog.tsx` – add / edit entry dialog
- `src/components/ui/` – shadcn components
