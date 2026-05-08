# ZeroRespond

**Incident Response platform for under-resourced organizations**

Detect · Respond · Report · Repeat

ZeroRespond is a unified, **self-hostable** incident response stack for teams that lack a dedicated SOC or enterprise tooling budget. It ties together **detection** (Wazuh-powered alerts), **guided response** (structured cases and command-level playbooks), and **DPDP Act 2023-compliant reporting** — deployed as containers on your own Linux server.

**Team Zero · Kumaraguru College of Technology · B.E. Computer Science · Batch 2023–2027**  
Naveen Kumar (Detection) · Ragul (Backend) · Manikandan (Frontend) · Prithiv Raj (Reports & DevOps)

---

## Why this exists

Many Indian SMBs, colleges, hospitals, and NGOs have no documented IR playbook, no centralized case history, and no audit-ready breach documentation. Commercial SIEM/IR suites cost ₹50,000+/year and require specialist skills. ZeroRespond gives these organizations a single open-source codebase: logs in → alerts rationalized into cases → responders guided step-by-step → DPDP-compliant PDF reports out — all without sending data to a SaaS vendor.

---

## Features

| Layer | What it provides |
|-------|-----------------|
| **Detection** | Wazuh-based log ingestion, 50+ custom correlation rules, anomalies → structured alerts |
| **Cases** | Auto-created incident cases when Wazuh fires critical/high alerts |
| **Playbooks** | 5 attack-type playbooks (Ransomware, Phishing, Unauthorized Access, Data Exfiltration, Insider Threat) with command-level steps for Linux and Windows |
| **Reports** | DPDP Act 2023 §8(6) compliant PDF — breach type, data categories, affected persons, timeline, CERT-In notification template |
| **Dashboard** | ZeroDashboard: live alert feed, incident queue, heatmaps, MTTD/MTTR charts, playbook step-through |

**Cost model:** Zero licensing cost. Runs on a single Linux server via Docker. No SaaS, no vendor lock-in.

---

## Technology stack

| Area | Choices |
|------|---------|
| Detection engine | Wazuh 4.7 + indexer (OpenSearch) |
| Backend API | Python 3.11, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 15 |
| Frontend | React 19, Vite 6, Tailwind CSS v4, react-router-dom v7, Recharts |
| Landing site | React 19, Vite 6, plain CSS (no framework) |
| Reporting | Jinja2 HTML → PDF (WeasyPrint) |
| Deployment | Docker and Docker Compose (single-host) |

Communication: **REST + WebSockets** for real-time alerts.

---

## Repository layout

```
ZeroRespond/
├── landing/                   # Marketing site: Vite + React; Dockerfile + nginx (:5174)
│   ├── src/
│   │   ├── App.tsx            # Full landing page with terminal animation
│   │   └── landing.css        # Design tokens + all landing styles
│   ├── Dockerfile
│   └── nginx.conf
├── frontend/                  # ZeroDashboard: Vite + React + Tailwind
│   ├── src/
│   │   ├── App.tsx            # Route table
│   │   ├── main.tsx           # BrowserRouter bootstrap
│   │   ├── index.css          # Tailwind v4 entry
│   │   ├── zerorespond-ui.css # Full dashboard theme (CSS variables, components)
│   │   ├── mock/
│   │   │   └── fixtures.ts    # Incident, alert, playbook, metrics stubs
│   │   ├── components/
│   │   │   ├── SeverityBadge.tsx
│   │   │   ├── alerts/LiveAlertCard.tsx
│   │   │   ├── case/          # AlertSummaryCard, CaseTimeline, EvidenceList,
│   │   │   │                  # IncidentPhaseStrip, PlaybookStepList, ResponderNotes
│   │   │   ├── dashboard/     # DashboardHeatmap, IncidentQueueCards, IncidentTable,
│   │   │   │                  # IncidentToolbar, NewCaseModal
│   │   │   └── metrics/IncidentDensityHeatmap.tsx
│   │   ├── layouts/MainLayout.tsx
│   │   ├── lib/incidentDisplay.ts
│   │   └── pages/
│   │       ├── DashboardPage.tsx
│   │       ├── IncidentsPage.tsx
│   │       ├── IncidentDetailPage.tsx
│   │       ├── AlertsPage.tsx
│   │       ├── MetricsPage.tsx
│   │       ├── PlaybooksPage.tsx
│   │       ├── EvidencePage.tsx
│   │       ├── ReportsPage.tsx
│   │       ├── OrgProfilePage.tsx
│   │       └── SettingsPage.tsx
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                   # FastAPI app, PostgreSQL migrations (in progress)
├── detection/                 # Wazuh rules, decoders, alert processor (in progress)
├── scripts/                   # Backup, restore, maintenance helpers
├── zerorespond_landing.html   # Static prototype of landing (reference)
├── zerorespond_app.html       # Static prototype of dashboard (reference)
├── docker-compose.yml         # All services
├── netlify.toml               # Landing → Netlify (build + publish landing/dist)
├── .env.example               # Required env vars template
└── README.md
```

---

## Prerequisites

- **Node.js 20+** and npm 10+ (for local frontend/landing development)
- **Docker Engine** and Docker Compose v2
- Recommended OS: Ubuntu 22.04 LTS

---

## Quick start

### 1. Clone

```bash
git clone https://github.com/project-kadavusol/ZeroRespond.git
cd ZeroRespond
```

### 2. Install all workspace dependencies

```bash
npm install
```

### 3. Run landing page (marketing site)

```bash
npm run dev:landing
# Open http://127.0.0.1:5174
```

### 4. Run ZeroDashboard

```bash
npm run dev
# Open http://127.0.0.1:5173
```

### 5. Run both simultaneously

```bash
npm run dev:all
```

### 6. Docker — dashboard only

```bash
docker compose up -d --build zerorespond-frontend
# Open http://localhost:5173
```

### 7. Docker — landing only

```bash
docker compose up -d --build zerorespond-landing
# Open http://localhost:5174
```

### 8. Docker — both frontend services

```bash
docker compose up -d --build zerorespond-frontend zerorespond-landing
```

### 9. Full stack (when backend + Wazuh Dockerfiles are complete)

```bash
docker compose up -d
```

---

## Module ownership

| Module | Scope | Owner |
|--------|-------|-------|
| **M1** | Wazuh, 50+ custom rules, alert processor | Naveen Kumar |
| **M2 + M3** | Case manager API, Playbook engine API | Ragul |
| **M4** | DPDP PDF pipeline, Docker Compose, backups, deployment docs | Prithiv Raj |
| **M5** | ZeroDashboard (this README section) | Manikandan |

---

## Frontend — Module 5 (ZeroDashboard)

Module 5 is the **central real-time UI**: incident queue, case detail, playbook step-through, live alert feed, heatmaps, and MTTD/MTTR charts. Designed for non-expert IT admins who need clarity under stress.

See [`frontend/FRONTEND_DOCS.docx`](./frontend/FRONTEND_DOCS.docx) for the full module 5 technical documentation (auto-generated from source).

### Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `DashboardPage` | KPI cards, incident table, live alert feed, MTTD chart, category bar, alert heatmap |
| `/incidents` | `IncidentsPage` | Full incident list with toolbar, search, new case modal |
| `/incidents/:id` | `IncidentDetailPage` | Alert summary, phase strip, case timeline, playbook steps, evidence, notes |
| `/alerts` | `AlertsPage` | Full live alert feed (Wazuh-backed in production) |
| `/metrics` | `MetricsPage` | MTTD/MTTR line charts, incidents per month, severity donut, 35-day activity heatmap |
| `/playbooks` | `PlaybooksPage` | 5 attack-type playbook cards |
| `/evidence` | `EvidencePage` | Evidence vault with SHA-256 hashes |
| `/reports` | `ReportsPage` | DPDP and executive report library |
| `/org-profile` | `OrgProfilePage` | Organization legal and DPDP liaison details |
| `/settings` | `SettingsPage` | Integrations, notification rules, API key management |

### Key components

| Component | Purpose |
|-----------|---------|
| `MainLayout` | Fixed topbar + sidebar navigation shell |
| `SeverityBadge` | Critical / High / Medium / Low chip |
| `DashboardHeatmap` | GitHub-style 7×24 alert density grid with tooltip |
| `IncidentDensityHeatmap` | GitHub-style 35-day contribution graph with tooltip + legend |
| `IncidentTable` | Sortable incident row table with severity bars |
| `PlaybookStepList` | Numbered step-through with Linux/Windows command tabs |
| `CaseTimeline` | Immutable timestamped event log |
| `LiveAlertCard` | Alert row with severity colour bar and host |
| `NewCaseModal` | Modal form for creating a new incident case |

### Design system

All dashboard styles live in `src/zerorespond-ui.css` (scoped under `.zr-app`). Key tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#00e5b0` | Primary CTA, success, active state |
| `--accent2` | `#3b7cff` | Secondary highlight, links |
| `--red` | `#ff4555` | Critical severity, danger |
| `--amber` | `#ffb300` | High severity, warning |
| `--purple` | `#9b6dff` | Playbook, informational |
| `--bg` | `#07080f` | Page background |
| `--card` | `#0f1320` | Card / panel background |
| `--txt` | `#e8eeff` | Primary text |
| `--muted2` | `#8895b3` | Secondary text |
| `--mono` | JetBrains Mono | Code, IDs, badges |

### npm scripts

From repo root after `npm install`:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dashboard dev server at **http://127.0.0.1:5173** |
| `npm run dev:landing` | Landing dev server at **http://127.0.0.1:5174** |
| `npm run dev:all` | Both servers simultaneously |
| `npm run build` | Production bundle (dashboard + landing) |
| `npm run lint` | ESLint over frontend |

### One-time scaffold commands (for reference)

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install react-router-dom recharts
```

---

## Landing page (marketing)

`landing/` is the public-facing product page deployed to **[zerorespond.netlify.app](https://zerorespond.netlify.app)**.

| Section | Content |
|---------|---------|
| Hero | Product pitch + animated live terminal session (full IR case walkthrough) |
| Metrics band | MTTD 4.2 min · MTTR 22 min · 82% faster · 12% FP rate |
| Problem | Four pain-point cards + crisis statistics |
| Solution | Detect → Respond → Report → Track flow |
| Modules | All 5 platform modules |
| Comparison | ZeroRespond vs Wazuh / TheHive / DFIR-IRIS / Splunk |
| DPDP | §8(6) compliance field mapping + CERT-In SLA tracker |
| How it works | 3-step deploy guide |
| Deploy CTA | One-command Docker deploy with copy button |
| Footer | Platform links, docs links, Team Zero members |

**Netlify deploy config** (`netlify.toml`):
- Build command: `npm install && npm run build -w landing`
- Publish directory: `landing/dist`
- Node version: 22

---

## Public site on Netlify

[`netlify.toml`](./netlify.toml) builds the marketing site automatically on push to `main`.

Set **Base directory** to empty (repo root) in Netlify UI — the `netlify.toml` takes priority. Do **not** set it to `frontend/` or `landing/`.

---

## Security

- Do **not** commit `.env` or production credentials.
- Restrict access to Wazuh API credentials and JWT signing keys.
- Review evidence and PDF storage paths; keep uploads off public URLs.

---

## License

Pending team decision — add a `LICENSE` file (e.g., MIT) when chosen.

---

## Contributing

Coordinate API boundaries across modules — open issues for payloads, playbook schema, and PDF fields. PRs welcome once contribution guidelines exist.
