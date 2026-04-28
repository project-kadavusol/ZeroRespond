# ZeroRespond

**Incident Response platform for under-resourced organizations**

Detect · Respond · Report · Repeat

ZeroRespond is a unified, **self-hostable** incident response stack for teams that lack a dedicated SOC or enterprise tooling budget. It ties together **detection** (Wazuh-powered alerts), **guided response** (structured cases and command-level playbooks), and **reporting** oriented toward Indian regulatory context (Digital Personal Data Protection Act 2023, CERT-In notification workflows), deployed as containers on your own Linux server.

---

## Why this exists

Many Indian SMBs, colleges, hospitals, and NGOs have no documented IR playbook, no centralized case history, and no audit-ready breach documentation. Typical commercial SIEM/IR suites are inaccessible on cost and skills. ZeroRespond aims to give these teams a single open-source codebase: logs in, alerts rationalized into cases, responders guided step-by-step, and exportable incident reports—all without sending data to a SaaS vendor.

---

## Features (target architecture)

| Layer | What it provides |
|--------|------------------|
| **Detection** | Wazuh-based log ingestion, correlation rules, anomalies → structured alerts |
| **Response** | Incident case manager, five attack playbooks with platform-specific guidance (FastAPI) |
| **Reporting** | HTML templates rendered to PDF (e.g., WeasyPrint), fields aligned with DPDP breach-notification needs |
| **Dashboard** | React “ZeroDashboard”: incidents, playbook step-through, live alert feed, MTTD/MTTR-style metrics |

**Cost model:** License TBD—no vendor licensing for the codebase itself; you run it on infrastructure you control.

---

## Technology stack

| Area | Choices (from project spec) |
|------|------------------------------|
| Detection engine | Wazuh 4.x + indexer (OpenSearch) |
| Backend API | Python 3.11, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 15 |
| Frontend | React + **Vite**; **Tailwind CSS**; **react-router-dom**; **Recharts** (see `frontend/package.json` for exact versions) |
| Reporting | Jinja2 HTML → PDF (WeasyPrint primary; optional fallback) |
| Deployment | Docker and Docker Compose (single-host) |

Communication between dashboard and backend: **REST + WebSockets** for real-time alerts.

---

## Repository layout

```
ZeroRespond/
├── frontend/                  # ZeroDashboard: Vite + React + mock data (`frontend/src/mock/`)
├── backend/                   # FastAPI app, PostgreSQL migrations
│   └── app/reports/templates/ # Jinja2 layouts for incident PDFs
├── detection/
│   ├── wazuh/rules/           # Custom Wazuh rules
│   ├── wazuh/decoders/        # Optional decoders
│   └── alert_processor/       # Polls Wazuh API → backend / PostgreSQL alerts
├── scripts/                   # Backup, restore, maintenance helpers (as added)
├── docker-compose.yml         # Turns up DB + placeholder for full stack
├── .env.example               # Required env vars template
└── README.md
```

Wazuh stack services (`wazuh-indexer`, `wazuh-manager`, optional dashboard) remain **referenced in comments** inside `docker-compose.yml` until you wire official images and volumes.

---

## Prerequisites

- **Node.js** 20+ and npm (for `frontend/` development; see **Frontend — Module 5** below)
- Docker Engine and Docker Compose v2
- Recommended target: Ubuntu 22.04 LTS (or equivalent) with enough RAM for indexer + manager (consult Wazuh sizing guides as you scale)

---

## Quick start (scaffolding phase)

Implementations land incrementally across modules. Until all services build:

1. **Clone**
   ```bash
   git clone https://github.com/project-kadavusol/ZeroRespond.git
   cd ZeroRespond
   ```

2. **Environment**
   ```bash
   cp .env.example .env
   # Edit .env — use strong passwords and secrets; never commit .env
   ```

3. **Database only (currently defined in compose)**
   ```bash
   docker compose up -d zerorespond-db
   ```

4. **Frontend (ZeroDashboard) — local dev**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open the URL shown in the terminal (default **http://127.0.0.1:5173**).

5. Full stack (**after** Dockerfiles exist for backend, frontend, Wazuh, alert processor):

   ```bash
   docker compose up -d
   ```

6. **First-run**: When the backend ships, configure organization profile (`org_profile`-style endpoints) once per deployment, then ingest agents and alerts per detection module docs.

---

## Modules and ownership

| Module | Scope | Owner role |
|--------|--------|------------|
| **M1** | Wazuh, custom rules, alert processor integration | Detection engineering |
| **M2+M3** | Case manager, playbook engine APIs | Backend |
| **M4** | DPDP-oriented PDF pipeline, Compose, backups, deployment docs | Report + DevOps |
| **M5** | ZeroDashboard | Frontend |

**Team Zero (Kumaraguru College of Technology):** Naveen Kumar · Ragul · **Manikandan** (Frontend, Module 5) · Prithiv Raj

---

## Frontend — Module 5 (ZeroDashboard) — Manikandan

Per the project specification, Module 5 is the **central real-time UI** (**ZeroDashboard**): incident list, case detail, playbook step-through, live **WebSocket** alert feed, severity visualization, **MTTD/MTTR** and related charts. The UI should stay **clear under stress**, favour **non-expert admins** (minimal unexplained jargon), and remain **responsive** from about 768px width (tablet) upward.

### Scope and deliverables (from project document)

| Area | What you build |
|------|----------------|
| **Routing** | `react-router-dom` routes: `/dashboard`, `/incidents/:id`, `/alerts`, `/metrics` |
| **Main incident list** | Table: Case ID, severity, attack type, assignee, opened time, status → opens case detail |
| **Case detail** | Alert summary, timeline, playbook + step checklist, evidence list, notes |
| **Playbook step-through** | Numbered steps, Linux/Windows commands, expected outcome, **Mark complete** (+ timestamps via API) |
| **Alert feed** | Real-time Wazuh-backed alerts via **WebSocket**; **Create case** action |
| **Metrics** | MTTD / MTTR time series, incidents per month, severity mix, calendar-style heatmap (**Recharts**) |
| **UX** | Large severity badges, straightforward critical actions, tooltips on technical terms |

### Sprint checklist (two-week sprints)

| Sprint | Focus | Deliverables (spec) |
|--------|--------|----------------------|
| **1** **(done)** | Tooling + layout | Vite + React + **Tailwind**; routes above; **static mockups** for all four screens (dashboard, case **`INV-2042`** demo with playbook UX, alerts, metrics + heatmap sketch); **Recharts** wired; **`src/mock/fixtures`** + layered components |
| **2** | Cases API | Wire list + detail to `GET /cases`, `GET /cases/:id`; severity badges; status updates; evidence list; loading/error states |
| **3** | Playbooks + alerts | Step-through + step completion API; alert list via **WebSocket**; reconnect + status indicator |
| **4** | Metrics + polish | All charts; responsive 768px+; empty/loading states; cross-browser smoke (Chrome, Firefox, Edge) |

### Sprint 1 — completed (fixture-driven UI)

- **Shell:** `MainLayout` adds top header stripe (status pill + contextual title per route) beside the sidebar; footer note reminds teammates this sprint is offline-only.
- **Dashboard (`/dashboard`):** incident table (+ search/toolbar scaffolding), five mock rows sourced from **`MOCK_INCIDENTS`**, `SeverityBadge` styling.
- **Case detail (`/incidents/:id`):** **`INV-2042`** shows full static story — alert synopsis, immutable timeline shell, playbook with platform toggle & local “Mark complete”, evidence filenames, responder notes textarea.
- **Alerts (`/alerts`):** stacked cards with **`LiveAlertCard`**, **Create case** stub linking back to backlog until backend hook exists (Sprint 3 websocket).
- **Metrics (`/metrics`):** paired MTTD/MTTR line charts, incidents-per-month bar chart, severity donut, and `IncidentDensityHeatmap` grid for future calendar analytics.
- **Conventions:** React function components in **PascalCase** files; shared mock data in **`src/mock/fixtures.ts`**; presentational pieces under **`components/<area>/`**.

See `frontend/` tree below for authoritative paths after Sprint 1.

### Stack in this repository

| Piece | Package / tool |
|------|----------------|
| Build | **Vite** (`npm run dev` / `npm run build`) |
| UI | **React** (current template: React 19.x with Vite 8; matches React 18 patterns from the doc) |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` |
| Routing | **react-router-dom** |
| Charts | **recharts** |

### Prerequisites

- **Node.js** 20.x or newer (LTS recommended) and **npm** 10+, for local development under `frontend/`.

### Installing dependencies

From repository root:

```bash
cd frontend
npm install
```

Copy environment template (optional for local API base URL):

```bash
cp .env.example .env.local
# Edit VITE_API_BASE_URL if the FastAPI backend is not at http://localhost:8000
```

### npm scripts (dependency commands)

Run these **inside `frontend/`** after `npm install`:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (default **http://127.0.0.1:5173**) with HMR |
| `npm run build` | Typecheck (`tsc -b`) + production bundle to `frontend/dist/` |
| `npm run preview` | Serve the production build locally for smoke testing |
| `npm run lint` | ESLint over the project |

### One-time setup commands (already applied in this repo)

The app was scaffolded with **Vite’s React + TypeScript** template, then these dependencies were added (for reproducibility or recreating from scratch):

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install react-router-dom recharts
```

Tailwind is enabled in `vite.config.ts` via the `@tailwindcss/vite` plugin; global styles use `@import 'tailwindcss'` in `src/index.css`.

### Frontend layout (current)

```
frontend/
├── .env.example
├── index.html
├── package.json
├── vite.config.ts
├── public/
└── src/
    ├── mock/
    │   └── fixtures.ts       # Incident/alert/playbook/metrics stubs
    ├── index.css             # Tailwind entry
    ├── main.tsx              # BrowserRouter bootstrap
    ├── App.tsx               # Route table
    ├── components/
    │   ├── SeverityBadge.tsx
    │   ├── alerts/
    │   │   └── LiveAlertCard.tsx
    │   ├── case/
    │   │   ├── AlertSummaryCard.tsx
    │   │   ├── CaseTimeline.tsx
    │   │   ├── EvidenceList.tsx
    │   │   ├── PlaybookStepList.tsx
    │   │   └── ResponderNotes.tsx
    │   ├── dashboard/
    │   │   ├── IncidentTable.tsx
    │   │   └── IncidentToolbar.tsx
    │   └── metrics/
    │       └── IncidentDensityHeatmap.tsx
    ├── layouts/
    │   └── MainLayout.tsx   # Sidebar + top chrome
    └── pages/
        ├── DashboardPage.tsx       # /dashboard
        ├── IncidentDetailPage.tsx  # /incidents/:id (full mock on INV-2042)
        ├── AlertsPage.tsx          # /alerts
        └── MetricsPage.tsx         # /metrics + charts
```

---

## Security

- Do **not** commit `.env` or production credentials.
- Restrict access to Wazuh API credentials and JWT signing keys.
- Review evidence and PDF storage paths; keep uploads off public URLs.

---

## License

Pending team decision—add a `LICENSE` file (e.g., MIT) when chosen.

---

## Contributing

Coordinate API boundaries across modules—open issues for payloads, playbook schema, and PDF fields. PRs welcome once contribution guidelines exist.
