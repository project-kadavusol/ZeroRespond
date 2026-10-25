# ZeroRespond

**Incident Response platform for under-resourced organizations**

Detect · Respond · Report · Repeat

ZeroRespond is a unified, **self-hostable** incident response stack for teams that lack a dedicated SOC or enterprise tooling budget. It ties together **detection** (Wazuh-powered alerts), **guided response** (structured cases and command-level playbooks), and **DPDP Act 2023-compliant reporting** — deployed as containers on your own Linux server.

**Team Zero · Kumaraguru College of Technology · B.E. Computer Science · Batch 2023–2027**  
Naveen Kumar (Detection) · Ragul (Backend) · Kavin (Frontend) · Prithiv Raj (Reports & DevOps)

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

### 6. Full Stack Docker Compose Deployment

ZeroRespond is fully containerized. A single command boots the entire stack:

```bash
# 1. Copy and configure environment variables
cp .env.example .env

# 2. Build and launch all services in background
docker compose up -d --build

# 3. Check health of services
docker compose ps
curl http://localhost:8000/health
```

The stack exposes:
- **ZeroDashboard (Frontend)**: `http://localhost:5173`
- **ZeroRespond Landing Site**: `http://localhost:5174`
- **FastAPI Backend & Compliance Service**: `http://localhost:8000` (OpenAPI Docs: `http://localhost:8000/docs`)
- **PostgreSQL Database**: `localhost:5432` (`zerorespond-db`)

---

## System Integration & Module Connections

ZeroRespond connects four engineering modules into a single, cohesive incident response pipeline:

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│      Module 1: Detection       │         │    Module 5: ZeroDashboard     │
│       (Naveen Kumar)           │         │            (Kavin)             │
│  - Wazuh 4.7 SIEM / Syslog     │         │  - React 19 + Tailwind UI      │
│  - Alert Processor (Python)    │         │  - Playbook Execution UI       │
│  - 50+ MITRE ATT&CK Rules      │         │  - CERT-In 6h Countdown Clock  │
└───────────────┬────────────────┘         └───────▲────────────────┬───────┘
                │                                  │                │
      POST /alerts (JSON)                WebSocket │                │ POST /reports/generate/:id
                │                       Live Alerts│                │ GET /reports/:id/download
                ▼                                  │                ▼
┌──────────────────────────────────────────────────┴────────────────────────┐
│              Module 2 & 3: Case Management & Playbook Engine               │
│                                  (Ragul)                                   │
│  - FastAPI REST Backend (:8000)                                           │
│  - Automated Case Creation & Playbook Attachment                          │
│  - PostgreSQL 15 (Cases, Steps, Timeline, Evidence, Org Profile)          │
└──────────────────────────────────────┬────────────────────────────────────┘
                                       │
                      Internal Library / REST API
                                       │
                                       ▼
┌───────────────────────────────────────────────────────────────────────────┐
│              Module 4: Statutory Compliance & DevOps                       │
│                               (Prithiv Raj)                               │
│  - DPDP Act 2023 §8(6) & CERT-In 6-Hour SLA Compliance Engine             │
│  - WeasyPrint PDF Generation & Jinja2 A4 Paged-Media Template             │
│  - Ready-to-Send plain text dispatch for incident@cert-in.org.in          │
│  - Integrated Web API & Automated Daily Backup Scripts                    │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### Supported Attack Types & Mapping

ZeroRespond focuses on four core attack vectors common to under-resourced institutions, mapping each from detection rule to response playbook and statutory report:

| Attack Category | Key (`attack_type`) | Reference Case | Wazuh Detection Indicators | Statutory Focus |
|---|---|---|---|---|
| **Ransomware** | `ransomware` | `IR-08` | Mass file rename (`.encrypted`), `vssadmin` shadow copy deletion | High data confidentiality & availability breach |
| **Brute Force** | `bruteforce` | `IR-07` | 500+ failed SSH/RDP logins (`Event ID 4625`) | Account takeover attempt, perimeter intrusion |
| **Privilege Escalation** | `privilege_escalation` | `IR-06` | Unauthorized sudoers modification, Windows `Event ID 4672/4728` | Lateral movement, elevated administrative compromise |
| **File Integrity (FIM)** | `file_integrity` | `IR-05` | Syscheck alerts on `/etc/shadow`, `/etc/passwd`, system binaries | Critical system file tampering, backdoors |

---

### How to Connect Each Module (Developer Guide & Parameters)

#### 1. Detection Engine to Backend (Naveen ↔ Ragul)
Naveen operates the Wazuh 4.7 SIEM and implements the Python Alert Processor (`detection/alert_processor/`).

* **Wazuh API Configuration (`.env`)**:
  - `WAZUH_API_URL`: `https://wazuh-manager:55000` (within Docker) or `https://localhost:55000` (local).
  - `WAZUH_API_USER`: `wazuh-wui` (or admin service user).
  - `WAZUH_API_PASSWORD`: Configured during Wazuh manager initialization.
  - `verify_ssl=False`: Wazuh ships with self-signed TLS certificates by default. Disabling SSL verification in the Python HTTP client is required unless a custom internal CA is loaded.
* **Alert Severity Threshold**:
  - Wazuh evaluates rules on a 0–16 scale.
  - **Parameter Tweak**: The Alert Processor must filter for `rule.level >= 8` (High and Critical alerts only). Low-level operational events must be suppressed to maintain the team's false-positive rate under 15%.
* **Attack Type Classification**:
  - The Alert Processor must categorize each incident into one of the four exact string keys: `"ransomware"`, `"bruteforce"`, `"privilege_escalation"`, or `"file_integrity"`.
* **Backend Webhook Endpoint & JSON Contract**:
  - **Target**: `POST http://localhost:8000/alerts` (or `http://zerorespond-api:8000/alerts` in Docker)
  - **Payload Schema**:
    ```json
    {
      "rule_id": "100201",
      "rule_description": "Mass file encryption detected - Ransomware activity",
      "severity": "critical",
      "attack_type": "ransomware",
      "source_host": "KCTLAB-WIN01",
      "source_ip": "192.168.1.45",
      "attacker_ip": "185.220.101.44",
      "detected_at": "2026-10-25T14:05:00+05:30",
      "data_categories": ["Student Records", "Financial Information"],
      "estimated_persons_affected": 850
    }
    ```

---

### Wazuh Custom Webhook Integration Guide

Follow these steps to configure a custom Python Flask/FastAPI webhook integration with Wazuh.

#### Prerequisites
- Administrative root access to the Wazuh Manager.
- Python 3 installed on the target machine where the webhook server will run.

#### Step 1: Add the Custom Integration Script
Place your custom Python script into the default Wazuh integrations directory:
- **File Location:** `/var/ossec/integrations/custom-fapi-flask.py`

Make sure to assign the proper execution permissions and ownership:
```bash
sudo chmod 750 /var/ossec/integrations/custom-fapi-flask.py
sudo chown root:wazuh /var/ossec/integrations/custom-fapi-flask.py
```

#### Step 2: Configure the Integration in Wazuh Manager
Add the integration block to `/var/ossec/etc/ossec.conf` inside the `<ossec_config>` section:
```xml
<ossec_config>
  <integration>
    <name>custom-fapi-flask.py</name>
    <hook_url>http://localhost:8000/alerts</hook_url>
    <level>8</level>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

#### Step 3: Restart Wazuh Manager
Restart the Wazuh manager daemon to activate the custom webhook integration:
```bash
sudo systemctl restart wazuh-manager
```

---

#### 2. Backend to Frontend & Database (Ragul ↔ Kavin)
Ragul operates the FastAPI REST backend (`backend/app/main.py`), SQLAlchemy ORM, and PostgreSQL database.

* **Database Connection (`.env`)**:
  - `DATABASE_URL=postgresql://zerorespond:change-me@zerorespond-db:5432/zerorespond` (within Docker) or `localhost:5432` (host).
* **CORS Middleware Configuration**:
  - Must permit Kavin's frontend origins: `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:5174`.
* **Case Creation & WebSocket Push**:
  - Upon receiving `POST /alerts`, Ragul's code auto-creates a case in PostgreSQL, sets `status = "open"`, maps the playbook matching `attack_type`, starts the statutory CERT-In 6-hour SLA clock, and pushes an alert payload via WebSocket:
    `ws://localhost:8000/ws/alerts`
* **Playbook Step Tracking Endpoint**:
  - **Endpoint**: `PATCH /cases/{case_id}/steps/{step_id}/complete`
  - Must record: `completed_at` (IST timestamp), `responder_name`, and `command_executed`. These records populate the chronological audit log required by Section 8(6) of the DPDP Act.
* **Invoking Report Generation**:
  - When an incident is marked resolved or when requested by the frontend, Ragul's backend calls:
    ```python
    from services.report_generator import generate_report
    report_res = generate_report(case_dict)
    ```

#### 3. Frontend Integration & Reporting (Kavin ↔ Ragul & Prithiv Raj)
Kavin operates the React 19 + Tailwind dashboard (`frontend/`).

* **API Configuration (`frontend/.env`)**:
  - `VITE_API_BASE_URL=http://localhost:8000`
* **Real-time Alert Subscription**:
  - Connect to WebSocket: `ws://localhost:8000/ws/alerts` for live alert toasts.
* **REST API Endpoints**:
  - `GET /cases` — Populates active and resolved incident queues.
  - `GET /cases/{id}` — Populates case details, dynamic variables, and playbook step list.
  - `PATCH /cases/{id}` — Updates status, responder notes, and completed actions.
  - `POST /cases/{id}/evidence` — Uploads evidence screenshots and logs.
* **Compliance Reporting Handlers**:
  - **Generate**: `POST http://localhost:8000/reports/generate/{case_id}`
  - **Download PDF**: `GET http://localhost:8000/reports/{case_id}/download` (streams court-admissible WeasyPrint PDF)
  - **HTML Preview**: `GET http://localhost:8000/reports/{case_id}/preview`
  - **CERT-In Email Notice**: `GET http://localhost:8000/reports/{case_id}/cert-in-email` (pre-formatted statutory plain text)
* **Fail-Safe Offline Demo Mode**:
  - If the backend is not running, the frontend gracefully falls back to interactive mock fixtures (`src/mock/fixtures.ts`) and browser print dialog (`window.print()`), ensuring demonstrations never crash.

---

### Inter-Module Integration Checklist

```text
Naveen Kumar (Module 1 - Detection):
  [ ] Alert Processor polls Wazuh Manager API on port 55000 (verify_ssl=False)
  [ ] Suppress alerts below rule level 8 (keeps False Positive rate < 15%)
  [ ] Categorize alerts into 4 exact attack_types: ransomware, bruteforce, privilege_escalation, file_integrity
  [ ] Send formatted JSON webhook to POST http://localhost:8000/alerts

Ragul (Modules 2 & 3 - Backend & Playbooks):
  [ ] Configure DATABASE_URL for PostgreSQL 15 container (port 5432)
  [ ] Enable CORS for frontend origins (http://localhost:5173, http://localhost:5174)
  [ ] Auto-create case on POST /alerts and emit real-time event to ws://localhost:8000/ws/alerts
  [ ] Implement PATCH /cases/{id}/steps/{step_id}/complete to record timestamped actions
  [ ] Integrate services.report_generator for POST /reports/generate/{case_id}

Kavin (Module 5 - ZeroDashboard):
  [ ] Set VITE_API_BASE_URL=http://localhost:8000 in frontend/.env
  [ ] Subscribe to ws://localhost:8000/ws/alerts for live alert feed
  [ ] Wire "Generate Report" to POST /reports/generate/{case_id}
  [ ] Wire "Download PDF" to GET /reports/{case_id}/download
  [ ] Preserve offline mock fallback for fail-safe live presentations

Prithiv Raj (Module 4 - Compliance & DevOps):
  [ ] All 8 DPDP Act 2023 §8(6) mandatory disclosure fields compiled in WeasyPrint PDF
  [ ] CERT-In 6-Hour SLA countdown timer computed dynamically (IST)
  [ ] Docker Compose orchestration for full stack (db, api, frontend, landing)
  [ ] Automated daily PostgreSQL backup and restore scripts validated
```

---

## Backup, Disaster Recovery & Maintenance (Module 4B)

### Automated Daily PostgreSQL Backups
Backups can be automated via cron to execute daily at 02:00 AM:
```bash
# Test manual backup
./scripts/backup.sh

# Add to crontab
0 2 * * * /bin/bash /path/to/ZeroRespond/scripts/backup.sh >> /var/log/zerorespond_backup.log 2>&1
```
Backups are saved to `data/backups/db_YYYYMMDD_HHMMSS.sql.gz` and automatically pruned after 30 days.

### Database Restoration Procedure
To restore the database from a backup file:
```bash
# Restore from the latest available backup
./scripts/restore.sh

# Restore from a specific backup archive
./scripts/restore.sh data/backups/db_20261025_120000.sql.gz
```

---

## Module Ownership & Team Roster

| Module | Scope | Owner | Key Deliverables |
|--------|-------|-------|------------------|
| **Module 1** | Threat Detection Feed | Naveen Kumar | Wazuh 4.7 SIEM, 50+ custom detection rules, Python Alert Processor |
| **Modules 2 & 3** | Case Manager & Playbook Engine | Ragul | FastAPI backend, PostgreSQL schemas, 5 command-level playbooks |
| **Module 4** | Statutory Reports & DevOps | Prithiv Raj | DPDP §8(6) & CERT-In report engine, WeasyPrint PDF, Docker Compose, backups |
| **Module 5** | ZeroDashboard UI | Kavin | React 19 command center, real-time alert feed, live countdown timer |

---

## Security & Regulatory Compliance

- **DPDP Act 2023 Section 8(6)**: Mandates immediate notification to Data Protection Board and impacted Data Principals describing the nature of breach, affected personal data categories, and recommended mitigation.
- **CERT-In 6-Hour SLA**: IT Act §70B statutory deadline measured strictly from initial detection timestamp (`detected_at`).
- **Data Privacy**: All data is self-hosted. Zero telemetry, zero external SaaS leakage.

---


