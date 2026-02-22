# Gravitee API Client

An API testing client for Gravitee API Management—similar to Postman and Insomnia. Test and debug your APIs with collections, environments, and import/export support.

## Run Locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Collections & Requests** — Organize APIs into collections with folders
- **Import/Export** — Supports Postman and Insomnia collection formats
- **Params, Headers, Body** — Full request customization
- **Response Viewer** — Status, headers, timing, and formatted body/JSON
- **History** — Recent requests persisted (last 50)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (port 3000) |
| `pnpm build` | Production build → `dist/public` |
| `pnpm preview` | Preview production build locally |

## Tech Stack

- React 19 + Vite 6
- Tailwind CSS 4 + shadcn/ui
- TypeScript
- lucide-react (icons)
- sonner (toasts)

## Code Review

See [CODE_REVIEW.md](./CODE_REVIEW.md) for a detailed review, architecture notes, and improvement recommendations.
