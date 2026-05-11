# জুলাই সনদ বাস্তবায়ন আন্দোলন

TanStack Start + React 19 + Vite 7 + Tailwind CSS v4 + Lovable Cloud (Supabase) দিয়ে তৈরি ওয়েবসাইট।

## 🚀 Tech Stack

- **Framework:** TanStack Start v1 (SSR + Server Functions)
- **Build Tool:** Vite 7
- **UI:** React 19, Tailwind CSS v4, shadcn/ui
- **Backend:** Lovable Cloud (Supabase) — Auth, Database, Storage
- **Routing:** TanStack Router (file-based)
- **Deploy:** Vercel (Node.js runtime) / Lovable Publish

## 📦 Local Development

```bash
# 1. Clone
git clone <your-repo-url>
cd <project-folder>

# 2. Install dependencies
bun install   # or: npm install

# 3. Set environment variables (.env auto-managed by Lovable Cloud)
#    VITE_SUPABASE_URL=...
#    VITE_SUPABASE_PUBLISHABLE_KEY=...
#    SUPABASE_URL=...
#    SUPABASE_SERVICE_ROLE_KEY=...

# 4. Run dev server
bun run dev   # or: npm run dev
```

App will be available at `http://localhost:8080`.

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |

## 📁 Project Structure

```
src/
├── routes/              # File-based routes (TanStack Router)
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # Home page
│   ├── admin-dashboard/ # Admin panel routes
│   └── api/             # Server routes (webhooks etc.)
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── ...
├── integrations/
│   └── supabase/        # Supabase clients (auto-generated)
├── lib/                 # Server functions & utilities
└── styles.css           # Tailwind + design tokens
```

## ☁️ Deployment

### Lovable Publish (default)
Click **Publish** in the Lovable editor — your site is live at `*.lovable.app`.

### Vercel
See [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md) for full instructions.

Quick steps:
1. Push to GitHub
2. Import the repository in Vercel
3. Set environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.)
4. Deploy — `api/ssr.ts` runs as a Node.js Serverless Function

## 🔐 Admin Access

- প্রথম নিবন্ধিত ব্যবহারকারী স্বয়ংক্রিয়ভাবে **সুপার অ্যাডমিন** হন
- অ্যাডমিন প্যানেল: `/admin-dashboard`
- লগইন: `/login`

## 🔄 GitHub Sync

This project is connected to GitHub via Lovable's two-way sync:
- Changes in Lovable → auto-pushed to GitHub
- Changes pushed to GitHub → auto-synced to Lovable

## 📄 License

© জুলাই সনদ বাস্তবায়ন আন্দোলন. All rights reserved.
