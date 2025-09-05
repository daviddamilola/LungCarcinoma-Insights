# Lung Carcinoma Insights

A web application that visualizes the top gene–disease associations for lung carcinoma, powered by the Open Targets GraphQL API.

The app fetches association data via GraphQL, processes it server‑side (BFF/SSR), and renders an expandable table with interactive charts.

---

## ✨ Features

- **Association Table** — Top 10 genes for lung carcinoma with overall scores; rows expand to reveal charts
- **Bar Chart** — Per‑datatype association scores (0–1)
- **Radar Chart** — Multi‑axis overview of scores
- **Material UI** — Accessible, responsive UI with custom styling
- **SSR + Data APIs** — React Router v7 Framework mode (server loaders)
- **E2E Tests** — Playwright tests verify table, tabs, charts, and links

---

## 🛠️ Tech Stack

- **Framework**: React Router v7 (Framework mode) + Vite
- **Language**: TypeScript
- **UI**: Material UI (MUI)
- **Charts**: D3.js (custom SVG)
- **GraphQL Client**: `graphql-request`
- **Codegen**: GraphQL Code Generator
- **Testing**: Playwright
- **Deployment**: Fly.io (Docker)

---

## 📂 Project Structure

```
app/
  components/        # AssociationTable, BarChart, RadarChart
  graphql/           # queries.graphql, generated.ts (codegen output)
  lib/               # graphql client, label helpers
  routes/            # home.tsx
  root.tsx           # app document & providers
build/               # client & server bundles
public/              # static assets
tests/e2e/           # Playwright specs
vite.config.ts       # Vite + SSR bundling (noExternal for MUI/Emotion)
react-router.config.ts
codegen.ts           # GraphQL Code Generator config
fly.toml             # Fly.io config
Dockerfile           # multi-stage build
```

---

## Data Flow (BFF)
We adopt a Backend For Frontend Approach to load the data from the open targets API
1. **Loader** (`home.tsx`) runs on the server
2. Uses `getSdk(getClient())` from **codegen** + `graphql-request`
3. Maps results → `AssocRow[]` (id, symbol, name, score, datatypeScores)
4. Returns JSON to the route element → renders **AssociationTable**

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 22
- npm ≥ 10

### Install

```bash
npm install
```

### Generate GraphQL SDK

```bash
npm run codegen
```

> there might be a need to add type to RequestOptions after codegen.
`import { GraphQLClient, type RequestOptions } from 'graphql-request';`
> `npm i graphql graphql-tag`

### Development

```bash
npm run dev
```

Visit http://localhost:5173

### Typecheck

```bash
npm run typecheck
```

### Build

```bash
npm run build
```

### Start (production)

```bash
npm start
```

---

## 🧪 Testing (Playwright)

Run E2E tests:

```bash
npm run test:e2e
```

Key spec: `tests/e2e/association.spec.ts` — verifies headers, expand/collapse, tabs, bar chart, radar chart (path visible), and external links.

---

## 🔧 Linting & Hooks

- **ESLint (flat config)**
  - Type‑aware TS rules (typescript‑eslint)
  - React, hooks, a11y, import sorting, unused imports

```bash
npm run lint
npm run lint:fix
```

---

## ☁️ Deployment (Fly.io)

### Dockerfile

Multi‑stage build → copy built app to slim runtime; server listens on `$PORT`.

### fly.toml (Machines‑style)

```toml
[http_service]
  internal_port = 3000
  force_https = true
  auto_start_machines = true
  auto_stop_machines = "stop"
  min_machines_running = 0
```

### Deploy

```bash
fly auth login
fly deploy
fly open
```


### Secrets

```bash
fly secrets set GRAPHQL_API_URL="https://api.platform.opentargets.org/api/v4/graphql"
```

---

## 🔁 CI/CD (GitHub Actions)

- **CI** runs Playwright tests on every push/PR
- **Deploy** deploys the main branch to fly.io when a merge is done

---

## 🧩 Key Components

- **AssociationTable** — MUI table with expand/collapse, tabs, and chart views
- **BarChart** — D3 vertical bars; labeled axes; title
- **RadarChart** — D3 radial polygon with rings, spokes, markers, labels

---

---

## 📜 License

MIT — see `LICENSE`.

