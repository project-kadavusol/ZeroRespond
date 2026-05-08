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
| **M5** | ZeroDashboard — see `frontend/FRONTEND_DOCS.docx` | Manikandan |

---

## Frontend & Landing — Module 5

All frontend and landing page technical documentation is maintained in [`frontend/FRONTEND_DOCS.docx`](./frontend/FRONTEND_DOCS.docx) (auto-regenerated on every relevant commit via `.git/hooks/pre-commit`).

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
