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
| Frontend | React 18, Tailwind CSS, Vite (charts e.g., Recharts) |
| Reporting | Jinja2 HTML → PDF (WeasyPrint primary; optional fallback) |
| Deployment | Docker and Docker Compose (single-host) |

Communication between dashboard and backend: **REST + WebSockets** for real-time alerts.

---

## Repository layout

```
ZeroRespond/
├── frontend/                  # ZeroDashboard UI (React)
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

4. Full stack (**after** Dockerfiles exist for backend, frontend, Wazuh, alert processor):
   ```bash
   docker compose up -d
   ```

5. **First-run**: When the backend ships, configure organization profile (`org_profile`-style endpoints) once per deployment, then ingest agents and alerts per detection module docs.

---

## Modules and ownership

| Module | Scope | Owner role |
|--------|--------|------------|
| **M1** | Wazuh, custom rules, alert processor integration | Detection engineering |
| **M2+M3** | Case manager, playbook engine APIs | Backend |
| **M4** | DPDP-oriented PDF pipeline, Compose, backups, deployment docs | Report + DevOps |
| **M5** | ZeroDashboard | Frontend |

**Team Zero (Kumaraguru College of Technology):** Naveen Kumar · Ragul · Manikandan · Prithiv Raj

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
