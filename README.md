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

#### 1. Detection Engine to Backend (Naveen ↔ Backend Integration)
Naveen operates the Wazuh 4.7 SIEM, manages the monitored virtual machines, and executes the simulation attack scenarios.

* **Wazuh API Configuration (`.env`)**:
  - `WAZUH_API_URL`: `https://wazuh-manager:55000` (within Docker) or `https://localhost:55000` (local).
  - `WAZUH_API_USER`: `wazuh-wui` (or admin service user).
  - `WAZUH_API_PASSWORD`: Configured during Wazuh manager initialization.
  - `verify_ssl=False`: Wazuh ships with self-signed TLS certificates by default. Disabling SSL verification in the Python HTTP client is required unless a custom internal CA is loaded.
* **Alert Severity Threshold**:
  - Wazuh evaluates rules on a 0–16 scale.
  - **Threshold**: The integration triggers for `rule.level >= 8` (or custom rules `100001`–`100004` at level 12+ for critical breaches). Low-level operational noise is automatically filtered out.
* **Deduplication Engine**:
  - ZeroRespond features a **5-minute sliding window deduplication algorithm**. Repeat alerts from the same attacker IP and agent within 5 minutes are grouped into the active case rather than spamming duplicate tickets.
* **Backend Webhook Endpoints & Contracts**:
  - **Primary Webhook**: `POST http://<ZERO_RESPOND_HOST_IP>:8000/api/v1/webhook/wazuh`
  - **Legacy Alias**: `POST http://<ZERO_RESPOND_HOST_IP>:8000/alerts`
  - ZeroRespond accepts **both** raw nested Wazuh 4.7 JSON alerts and normalized/flattened JSON payloads:
    ```json
    {
      "rule_id": "100002",
      "level": 12,
      "description": "SSH Brute Force Authentication Failure Spike",
      "threat_type": "Brute Force",
      "agent": "srv-lab-ssh01",
      "agent_ip": "192.168.1.120",
      "source_ip": "203.0.113.88",
      "target_user": "root"
    }
    ```

---

### Naveen's Wazuh SIEM & VM Simulation Setup Guide

This section provides the end-to-end instructions for deploying Wazuh Manager, connecting target VMs, configuring the webhook, and running attack simulations.

#### Step 1: Deploying the Wazuh Integration Script on Manager

The Wazuh Manager uses its `integratord` daemon to push alert JSON payloads to external webhooks.

1. Copy the integration script to the Wazuh Manager integrations directory (copying both with and without `.py` ensures compatibility across all Wazuh daemon versions):
   ```bash
   sudo cp detection/wazuh/custom-fapi-flask.py /var/ossec/integrations/custom-fapi-flask
   sudo cp detection/wazuh/custom-fapi-flask.py /var/ossec/integrations/custom-fapi-flask.py
   ```
   *(If Wazuh Manager runs in Docker container `single-node-wazuh.manager-1`:)*
   ```bash
   docker cp detection/wazuh/custom-fapi-flask.py single-node-wazuh.manager-1:/var/ossec/integrations/custom-fapi-flask
   docker cp detection/wazuh/custom-fapi-flask.py single-node-wazuh.manager-1:/var/ossec/integrations/custom-fapi-flask.py
   ```

2. Set ownership and executable permissions:
   ```bash
   sudo chown root:wazuh /var/ossec/integrations/custom-fapi-flask*
   sudo chmod 750 /var/ossec/integrations/custom-fapi-flask*
   ```

3. Configure the integration in `/var/ossec/etc/ossec.conf` inside the `<ossec_config>` section:
   ```xml
   <ossec_config>
     <!-- ZeroRespond SOAR Ingestion Integration -->
     <integration>
       <name>custom-fapi-flask</name>
       <hook_url>http://172.17.0.1:8000/api/v1/webhook/wazuh</hook_url>
       <level>8</level>
       <alert_format>json</alert_format>
     </integration>
   </ossec_config>
   ```
   *Network routing note:*
   - If Wazuh Manager runs in Docker: use the Docker bridge gateway `http://172.17.0.1:8000/api/v1/webhook/wazuh` to reach the FastAPI backend on the host.
   - If Wazuh Manager runs directly on the host or external VM: use `http://<ZERO_RESPOND_HOST_IP>:8000/api/v1/webhook/wazuh`.

4. Test configuration syntax and restart the Wazuh Manager:
   ```bash
   sudo /var/ossec/bin/wazuh-analysisd -t
   sudo /var/ossec/bin/wazuh-control restart
   # Or via systemd if installed natively:
   # sudo systemctl restart wazuh-manager
   ```
   *Verify integratord daemon started:* The output will confirm `Started wazuh-integratord...`.

---

#### Step 2: Deploying Wazuh Agents on Target Monitored VMs

To simulate real-world attacks, install the Wazuh Agent on the test virtual machines.

##### A. Linux Target VM (Ubuntu/Debian Server — e.g. `Ubuntu_agent`)
```bash
# 1. Add Wazuh repository key and source
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | sudo gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && sudo chmod 644 /usr/share/keyrings/wazuh.gpg
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | sudo tee -a /etc/apt/sources.list.d/wazuh.list
sudo apt-get update

# 2. Install agent pointing to your Wazuh Manager IP
sudo WAZUH_MANAGER="<WAZUH_MANAGER_IP>" WAZUH_AGENT_NAME="Ubuntu_agent" apt-get install wazuh-agent

# 3. Start the agent daemon
sudo systemctl daemon-reload
sudo systemctl enable wazuh-agent
sudo systemctl start wazuh-agent
```

##### B. Windows Target VM (Windows Server / 10 / 11 — e.g. `Windows_agent`)
Open an administrative PowerShell console:
```powershell
# 1. Download and install the Wazuh MSI package
Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.5-1.msi -OutFile wazuh-agent.msi
.\wazuh-agent.msi /q WAZUH_MANAGER="<WAZUH_MANAGER_IP>" WAZUH_AGENT_NAME="Windows_agent"

# 2. Verify and start the Windows service
Get-Service -Name "WazuhSvc"
Start-Service -Name "WazuhSvc"

# Or using command prompt / net:
net start WazuhSvc
```

##### C. Verify Connected Agents on Wazuh Manager
Run on the Wazuh Manager server:
```bash
sudo /var/ossec/bin/agent_control -l
# Or inside docker container:
# docker exec single-node-wazuh.manager-1 /var/ossec/bin/agent_control -l
```
*Expected output:*
```
Wazuh agent_control. List of available agents:
   ID: 000, Name: wazuh.manager (server), IP: 127.0.0.1, Active/Local
   ID: 001, Name: Ubuntu_agent, IP: 192.168.122.164, Active
   ID: 002, Name: Windows_agent, IP: any, Active
```

---

#### Step 3: Executing Practical Attack Simulation Scenarios

Naveen can execute any of these 4 attack scenarios from an attacker machine (Kali Linux or secondary VM) against the monitored targets:

```
┌────────────────────────┐      Attack Traffic     ┌────────────────────────┐
│  Attacker (Kali VM)    ├────────────────────────►│  Target VM (Agent)     │
│  IP: 203.0.113.88      │                         │  srv-lab-ssh01         │
└────────────────────────┘                         └───────────┬────────────┘
                                                               │ Event Logs (1514)
                                                               ▼
┌────────────────────────┐    Alert Webhook (8000) ┌────────────────────────┐
│  ZeroRespond Platform  │◄────────────────────────┤  Wazuh Manager SIEM    │
│  Case IR-XX + Playbook │                         │  Rule 100002 Triggers  │
└────────────────────────┘                         └────────────────────────┘
```

##### Scenario 1: SSH Brute Force Attack (`bruteforce`)
- **Target**: Linux VM (`srv-lab-ssh01` / `192.168.1.120`)
- **Action from Attacker VM**:
  ```bash
  # Using hydra to simulate password spraying:
  hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://<TARGET_VM_IP> -t 4
  
  # Or via quick bash failure loop:
  for i in {1..25}; do sshpass -p 'WrongPass123' ssh -o StrictHostKeyChecking=no invalid_user@<TARGET_VM_IP>; done
  ```
- **Wazuh Detection**: Rules `5710` / `5712` (Multiple authentication failures).
- **ZeroRespond Reaction**: Auto-opens Case, assigns **SSH/RDP Brute Force Playbook**, and dynamically interpolates firewall command:  
  `sudo iptables -I INPUT 1 -s <ATTACKER_IP> -j DROP`

##### Scenario 2: Privilege Escalation (`privilege_escalation`)
- **Target**: Linux VM (`srv-lab-ssh01`)
- **Action on Target VM**:
  ```bash
  # Simulate unexpected sudo or sudoers file tampering:
  sudo su -c "echo 'guest ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers.d/99-backdoor"
  ```
- **Wazuh Detection**: Rules `5402` / `5406` (Unauthorized sudo modification).
- **ZeroRespond Reaction**: Auto-opens Case, assigns **Privilege Escalation Playbook**, generates account lock command `sudo passwd -l <TARGET_USER>`, and prompts auditing `/etc/sudoers`.

##### Scenario 3: Ransomware Behavior Simulation (`ransomware`)
- **Target**: Windows VM (`KCTLAB-WIN01`)
- **Action on Target VM**:
  ```powershell
  # Simulate shadow copy deletion (standard precursor to ransomware):
  vssadmin delete shadows /all /quiet
  
  # Or simulate rapid file renaming:
  1..100 | ForEach-Object { Set-Content "C:\test_$_.txt" "sample data"; Rename-Item "C:\test_$_.txt" "C:\test_$_.locked" }
  ```
- **Wazuh Detection**: Rule `5801` / `5802` / `100001` (Shadow copy deletion or mass rename).
- **ZeroRespond Reaction**: Auto-opens Critical Ransomware Case, starts **CERT-In 6-Hour Countdown Clock**, isolates host network via `netsh advfirewall`, and prepares Section 8(6) disclosure.

##### Scenario 4: Critical File Integrity Tampering (`file_integrity`)
- **Target**: Linux VM (`srv-lab-ssh01`)
- **Action on Target VM**:
  ```bash
  # Tamper with critical system files monitored by syscheck:
  sudo touch -a /etc/shadow
  sudo echo "# backdoor" >> /etc/passwd
  ```
- **Wazuh Detection**: Syscheck Rule `550` / `554` (Integrity checksum changed).
- **ZeroRespond Reaction**: Auto-opens Case, displays FIM remediation playbook, and preserves SHA-256 evidence.

---

#### Step 4: End-to-End Verification Flow

1. **Fire the attack** on the monitored VM.
2. **Watch Wazuh alerts**:
   ```bash
   sudo tail -f /var/ossec/logs/alerts/alerts.json
   ```
3. **Verify ZeroRespond Case Ingestion**:
   ```bash
   curl -s http://localhost:8000/api/v1/cases | jq '.[0]'
   ```
4. **Open ZeroDashboard**:
   Navigate to `http://localhost:5173/incidents` — the new incident appears instantly in the queue.
5. **Execute Playbook Steps**:
   Click the incident, click the **Linux / Windows** command toggle, click **Copy**, paste command into VM terminal, and click **Done — Next Step**.
6. **Compile Statutory Compliance Report**:
   Click **Generate Report** or run:
   ```bash
   curl -s -X POST http://localhost:8000/reports/generate/<CASE_ID>
   ```
   Download court-admissible PDF at `http://localhost:8000/reports/<CASE_ID>/download` or preview CERT-In email dispatch at `http://localhost:8000/reports/<CASE_ID>/cert-in-email`.

---

#### Step 5: Troubleshooting & Edge-Case Checklist (For Different Laptops & Environments)

When setting up or verifying Wazuh on a teammate's laptop, home network, or different VM environment, note that **ZeroRespond interacts with Wazuh across two distinct channels**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TWO CONNECTION CHANNELS                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. PUSH WEBHOOK (Wazuh ➔ ZeroRespond)                                  │
│    Wazuh `integratord` fires alerts ➔ POST :8000/api/v1/webhook/wazuh  │
│    Controlled by: /var/ossec/etc/ossec.conf + custom-fapi-flask        │
│                                                                        │
│ 2. PULL MANAGER API (ZeroRespond ➔ Wazuh)                              │
│    ZeroRespond backend polls agents ➔ GET :55000/agents                │
│    Controlled by: .env (WAZUH_API_URL, WAZUH_API_USER, PASSWORD)       │
└────────────────────────────────────────────────────────────────────────┘
```

##### Pre-Flight Sanity Checks (Run These First!)

Before running attack simulations, execute these two fast 10-second checks to isolate any networking or credential issues:

**1. Test the Ingestion Webhook (Push Channel):**  
Run from the machine/container running Wazuh Manager:
```bash
curl -i -X POST http://<ZERO_RESPOND_IP>:8000/api/v1/webhook/wazuh \
  -H "Content-Type: application/json" \
  -d '{"rule":{"id":"100002","description":"Preflight Test Alert","level":10},"agent":{"id":"001","name":"Ubuntu_agent","ip":"192.168.1.120"},"data":{"srcip":"203.0.113.88","dstuser":"root"}}'
```
*Expected Response:* `HTTP/1.1 200 OK` with JSON `{"status": "success", "alert_id": ..., "case_id": "IR-..."}`.  
*If this succeeds:* The ZeroRespond backend is 100% operational. Any subsequent issue is in Wazuh's daemon or rule trigger.

**2. Test the Wazuh Manager API (Pull Channel):**  
Run from the machine running ZeroRespond backend:
```bash
curl -k -u wazuh-wui:MyS3cr37P450r.*- https://<WAZUH_MANAGER_IP>:55000/security/user/authenticate
```
*Expected Response:* `{"data":{"token":"..."}}` with HTTP 200.  
*Verify in ZeroDashboard:* Visit `http://localhost:5173/monitored-systems` to see connected agents.

---

##### Troubleshooting Matrix: Common Failure Modes & Fixes

| Issue | Root Cause | Exact Solution |
|---|---|---|
| **Wazuh triggers rule, but ZeroRespond shows nothing** | Integrator daemon is not pushing to webhook, or network hook URL is unreachable. | 1. Check logs: `sudo grep -E "integrat|custom-fapi" /var/ossec/logs/ossec.log`<br>2. Verify `<hook_url>` reachability (see Network Matrix below).<br>3. Verify rule level is $\ge 8$ (integrator filters out levels $< 8$). |
| **`integratord: error: Permission denied`** | Incorrect file permissions or ownership on `/var/ossec/integrations/custom-fapi-flask`. | Run:<br>`sudo chown root:wazuh /var/ossec/integrations/custom-fapi-flask*`<br>`sudo chmod 750 /var/ossec/integrations/custom-fapi-flask*` |
| **`ModuleNotFoundError: No module named 'requests'`** | Python shebang points to system python (`/usr/bin/python3`) without `requests`. | Ensure line 1 of script is:<br>`#!/var/ossec/framework/python/bin/python3`<br>*(Wazuh's embedded Python always includes `requests`).* |
| **`wazuh-integratord: INFO: Remote integrations not configured. Clean exit.`** | `<integration>` block missing or placed outside `<ossec_config>` tags in `/var/ossec/etc/ossec.conf`. | Verify the `<integration>` block is inside `<ossec_config>...</ossec_config>` and run `sudo /var/ossec/bin/wazuh-analysisd -t` to validate XML syntax before restarting. |
| **Agent status is `Disconnected` or `Never connected`** | Firewall blocking port `1514` (agent communication) or `1515` (registration). | On Linux agent: `nc -zv <MANAGER_IP> 1514`<br>On Windows agent: `Test-NetConnection -ComputerName <MANAGER_IP> -Port 1514`<br>Ensure Manager host allows inbound TCP/UDP on `1514` and TCP on `1515`. |
| **Windows Agent service fails to start** | Windows agent service stopped or named differently. | In admin PowerShell:<br>`Get-Service -Name "WazuhSvc"`<br>`Start-Service -Name "WazuhSvc"`<br>*(Note: Windows service is `WazuhSvc`, not `wazuh-agent`).* |
| **Monitored Systems page shows `Wazuh API: Disconnected`** | `.env` has incorrect `WAZUH_API_URL` or credentials. | Check `.env`: Ensure `WAZUH_API_URL=https://<MANAGER_IP>:55000`, `WAZUH_API_USER=wazuh-wui`, and password match the manager's API credentials. |

---

##### Network Matrix for `<hook_url>`:
Inside `/var/ossec/etc/ossec.conf`:
- **Wazuh Manager running in Docker container (`single-node-wazuh.manager-1`)**:  
  Use `http://172.17.0.1:8000/api/v1/webhook/wazuh` *(Docker default bridge gateway to reach host).*
- **Wazuh Manager running natively on the host (systemd)**:  
  Use `http://localhost:8000/api/v1/webhook/wazuh`.
- **Wazuh Manager running in a VirtualBox / VMware VM**:  
  Use `http://<HOST_IP>:8000/api/v1/webhook/wazuh` *(e.g. `http://192.168.56.1:8000/...` or `10.0.2.2:8000`)*.
- **Wazuh Manager and ZeroRespond on separate laptops over Wi-Fi/LAN**:  
  Use `http://<ZERO_RESPOND_LAPTOP_IP>:8000/api/v1/webhook/wazuh` *(e.g. `http://192.168.1.150:8000/...`)*.

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


