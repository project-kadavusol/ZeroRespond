# ZeroRespond Backend — Technical Architecture & Parameter Reference

**Team Zero · Kumaraguru College of Technology · B.E. Computer Science · Batch 2023–2027**  
*Modules 2, 3, & 4: Case Manager, Playbook Engine, Wazuh Ingestion & Statutory Compliance*

---

## 1. Architectural Overview

The ZeroRespond backend is an asynchronous, self-hosted Security Orchestration, Automation, and Response (SOAR) engine built with **Python 3.11**, **FastAPI**, **SQLAlchemy 2.0**, and **PostgreSQL 15**. It provides real-time SIEM alert normalization, 5-minute sliding window incident deduplication, interactive dual-platform playbook guidance, and court-admissible DPDP Act 2023 / CERT-In compliance reporting.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ZeroRespond Backend Subsystems                            │
└────────────────────────────────────────────────────────────────────────────────────────┘

        [ External / Host Ingestion ]
                      │
                      ▼
 ┌──────────────────────────────────────────┐
 │ 1. Ingestion & Webhook Layer             │  POST /api/v1/webhook/wazuh
 │    - parse_wazuh_alert()                 │  POST /alerts
 │    - 5-Min Sliding Window Dedup          │  POST /api/v1/sync-alerts
 └────────────────────┬─────────────────────┘
                      │
                      ▼
 ┌──────────────────────────────────────────┐
 │ 2. Case Management & Orchestration       │  GET/POST/PATCH /api/v1/cases
 │    - Dynamic Variable Interpolator       │  PATCH /api/v1/cases/{id}/steps/{step}
 │    - ISO 27035 Execution Stamping        │  POST /api/v1/cases/{id}/evidence
 └────────────────────┬─────────────────────┘
                      │
                      ▼
 ┌──────────────────────────────────────────┐
 │ 3. Relational Persistence Layer          │  PostgreSQL 15 Alpine
 │    - 8 Relational Tables (SQLAlchemy)    │  Engine Connection Pooling (10+20)
 │    - Automatic Master Playbook Seeding   │  Atomic Transactions
 └────────────────────┬─────────────────────┘
                      │
                      ▼
 ┌──────────────────────────────────────────┐
 │ 4. Compliance & Statutory Reporting      │  POST /reports/generate/{case_id}
 │    - DPDP Act 2023 §8(6) Engine          │  GET /reports/{case_id}/download
 │    - CERT-In 6-Hour SLA Countdown Clock  │  GET /reports/{case_id}/cert-in-email
 │    - WeasyPrint PDF A4 Paged Media       │  GET /reports/{case_id}/preview
 └──────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── __init__.py           # Package indicator
│   ├── database.py           # SQLAlchemy engine, session maker, get_db dependency, init_db
│   ├── models.py             # 8 Relational database models (Case, Playbook, Step, Evidence...)
│   ├── schemas.py            # Pydantic V2 DTOs with computed alias fields for frontend/CLI
│   ├── case_service.py       # Core business logic: parsing, dedup, interpolation, metrics
│   ├── seed.py               # Database seeder (4 Master Playbooks, benchmark cases IR-05 to 08)
│   └── main.py               # FastAPI application, route definitions, CORS, error handlers
├── services/
│   └── report_generator.py   # DPDP §8(6) & CERT-In report generator, WeasyPrint PDF compiler
├── templates/
│   └── report_template.html  # Jinja2 template with CSS Paged Media (@page A4, ISO 27035 styles)
├── Dockerfile                # Debian-slim Python 3.11 with WeasyPrint Pango/HarfBuzz libraries
├── requirements.txt          # Pinned backend dependencies
└── BACKEND_DOCS.md           # This document
```

---

## 3. Database Layer (`app/database.py`)

### Parameters & Configuration

| Parameter | Type | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | `str` | `postgresql://zerorespond:change-me@zerorespond-db:5432/zerorespond` | PostgreSQL connection string. Supports automatic shell variable expansion (`${POSTGRES_USER}`). |
| `pool_size` | `int` | `10` | Number of persistent database connections maintained in the pool. |
| `max_overflow` | `int` | `20` | Maximum number of transient connections permitted during traffic surges. |
| `pool_pre_ping` | `bool` | `True` | Tests connection liveness before query execution; prevents stale socket errors across container restarts. |
| `future` | `bool` | `True` | Enforces SQLAlchemy 2.0 transaction and session semantics. |

### Core Methods

- `get_db() -> Generator[Session, None, None]`: FastAPI dependency yielding a clean database session per HTTP request and guaranteeing session closure on completion.
- `init_db() -> None`: Invokes `Base.metadata.create_all(bind=engine)`. Called on server startup; non-blocking with error capture if the database is temporarily initializing.

---

## 4. Relational Database Models (`app/models.py`)

The database consists of 8 interconnected tables:

### 4.1. `cases` Table (`Case` Model)
Primary record for all security incidents ingested from SIEM or opened manually.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(32)` | `PRIMARY KEY` | Unique human-readable case identifier (e.g. `IR-08`, `IR-10`). |
| `title` | `VARCHAR(255)` | `NOT NULL` | Descriptive title (e.g., `LockBit Ransomware Activity Detected on srv-eng-nas01`). |
| `type` | `VARCHAR(64)` | `DEFAULT 'Ransomware'` | Attack taxonomy: `Ransomware`, `Brute Force`, `Privilege Escalation`, `File Integrity`. |
| `sev` | `VARCHAR(16)` | `DEFAULT 'critical'` | Machine severity: `critical`, `high`, `medium`, `low`. |
| `sev_lbl` | `VARCHAR(16)` | `DEFAULT 'Critical'` | UI presentation label: `Critical`, `High`, `Medium`, `Low`. |
| `computer` | `VARCHAR(128)` | `NOT NULL` | Affected host/agent hostname (e.g., `srv-eng-nas01`, `KCTLAB-WIN01`). |
| `source_ip` | `VARCHAR(64)` | `NULLABLE` | Local network IP address of the impacted machine (e.g., `192.168.1.45`). |
| `attacker_ip` | `VARCHAR(64)` | `NULLABLE` | External or internal IP address of the threat actor (e.g., `185.220.101.44`). |
| `suspect_pid` | `VARCHAR(32)` | `NULLABLE` | Operating system process ID of the malicious payload (e.g., `4192`). |
| `target_user` | `VARCHAR(64)` | `NULLABLE` | Compromised or targeted user account (e.g., `administrator`, `root`). |
| `modified_file` | `VARCHAR(255)` | `NULLABLE` | Encrypted or tampered file path (e.g., `/etc/shadow`, `C:\Data\finance.db`). |
| `c2_ip` | `VARCHAR(64)` | `NULLABLE` | Command-and-Control callback IP or domain (e.g., `198.51.100.23`). |
| `assigned_to` | `VARCHAR(128)` | `DEFAULT 'Naveen Kumar'` | Designated primary incident responder. |
| `status` | `VARCHAR(32)` | `DEFAULT 'open'` | Lifecycle state: `open`, `in-progress`, `contained`, `resolved`, `false-positive`. |
| `status_lbl` | `VARCHAR(32)` | `DEFAULT 'Open'` | UI status label: `Open`, `In-Progress`, `Contained`, `Resolved`. |
| `cur_step` | `INTEGER` | `DEFAULT 0` | 0-indexed integer of the currently active playbook step. |
| `pb` | `VARCHAR(32)` | `DEFAULT 'ransomware'` | Foreign key reference to active playbook (`ransomware`, `bruteforce`, etc.). |
| `data_categories` | `TEXT` | `DEFAULT '...'` | DPDP Act mandatory disclosure: Personal data categories exposed. |
| `persons` | `INTEGER` | `DEFAULT 0` | DPDP Act mandatory disclosure: Estimated number of impacted individuals. |
| `desc` | `TEXT` | `NULLABLE` | Comprehensive summary of incident context and forensic observations. |
| `detected_at` | `TIMESTAMP` | `NULLABLE` | Exact timestamp when detection rule first fired (Anchor for CERT-In 6-Hour SLA). |
| `breach_est_at` | `TIMESTAMP` | `NULLABLE` | Estimated time of initial perimeter penetration (Anchor for MTTD). |
| `contained_at` | `TIMESTAMP` | `NULLABLE` | Exact timestamp when network isolation / kill command was executed (Anchor for MTTR). |
| `resolved_at` | `TIMESTAMP` | `NULLABLE` | Timestamp when remediation, cleanup, and report generation completed. |
| `alert_hash` | `VARCHAR(64)` | `INDEX, NULLABLE` | SHA-256 fingerprint of the initial alert payload; enforces deduplication. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Database record insertion timestamp. |

### 4.2. `playbooks` Table (`Playbook` Model)
Standardized Operating Procedure (SOP) templates aligned with NIST SP 800-61 and ISO 27035.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(32)` | `PRIMARY KEY` | Standard identifier: `ransomware`, `bruteforce`, `privilege`, `fileintegrity`. |
| `name` | `VARCHAR(128)` | `NOT NULL` | Full title (e.g., `Ransomware Containment & Recovery SOP`). |
| `mitre_tag` | `VARCHAR(128)` | `NULLABLE` | MITRE ATT&CK mapping (e.g., `T1486 (Data Encrypted for Impact)`). |
| `iso_phase` | `VARCHAR(128)` | `NULLABLE` | ISO 27035 lifecycle phase reference. |
| `desc` | `TEXT` | `NULLABLE` | High-level procedure objective and execution boundaries. |

### 4.3. `playbook_steps` Table (`PlaybookStep` Model)
Executable actions defined in master playbooks.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY, AUTO` | Unique master step ID. |
| `playbook_id` | `VARCHAR(32)` | `FOREIGN KEY` | Reference to parent playbook. Cascades on delete. |
| `step_order` | `INTEGER` | `NOT NULL` | Sequential order of execution (1, 2, 3...). |
| `title` | `VARCHAR(255)` | `NOT NULL` | Action title (e.g., `Host Network Isolation`). |
| `phase` | `VARCHAR(64)` | `DEFAULT 'Containment'`| ISO phase: `Identification`, `Containment`, `Eradication`, `Recovery`. |
| `plain` | `TEXT` | `NOT NULL` | Plain-English explanation for non-specialist college IT staff. |
| `linux_cmd` | `TEXT` | `NOT NULL` | Linux Bash command with placeholders (e.g. `sudo iptables ...`). |
| `windows_cmd` | `TEXT` | `NOT NULL` | Windows PowerShell command with placeholders. |
| `expected_outcome` | `TEXT` | `NOT NULL` | Expected terminal response ("What you should see" verification box). |
| `is_blocking` | `BOOLEAN` | `DEFAULT FALSE` | Flag indicating mandatory execution before subsequent steps unlock. |

### 4.4. `case_steps` Table (`CaseStep` Model)
Cloned, case-specific step records maintaining live execution state.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY, AUTO` | Unique case step record ID. |
| `case_id` | `VARCHAR(32)` | `FOREIGN KEY` | Case foreign key. |
| `step_order` | `INTEGER` | `NOT NULL` | Sequential step order matching master template. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Step title. |
| `phase` | `VARCHAR(64)` | `NOT NULL` | Step lifecycle phase. |
| `plain` | `TEXT` | `NOT NULL` | Plain-English instructions. |
| `linux_cmd` | `TEXT` | `NOT NULL` | Linux command with live forensic variables substituted. |
| `windows_cmd` | `TEXT` | `NOT NULL` | Windows command with live forensic variables substituted. |
| `expected_outcome` | `TEXT` | `NOT NULL` | Verification criteria. |
| `is_completed` | `BOOLEAN` | `DEFAULT FALSE` | Execution completion toggle. |
| `completed_at` | `TIMESTAMP` | `NULLABLE` | Exact timestamp when step was marked complete. |
| `completed_by` | `VARCHAR(128)` | `NULLABLE` | Responder username or identity. |
| `notes` | `TEXT` | `NULLABLE` | Deviation logs, command output, or forensic observations. |

### 4.5. `evidence_items` Table (`EvidenceItem` Model)
Cryptographic evidence locker satisfying ISO 27037 and Indian Evidence Act Section 65B.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY, AUTO` | Unique evidence artifact ID. |
| `case_id` | `VARCHAR(32)` | `FOREIGN KEY` | Case foreign key. |
| `name` | `VARCHAR(255)` | `NOT NULL` | File name (e.g., `syslog_dump.txt`, `screenshot.png`). |
| `size` | `VARCHAR(32)` | `DEFAULT '0 KB'` | Human-readable file size string. |
| `size_bytes` | `BIGINT` | `DEFAULT 0` | Exact integer byte size. |
| `sha256` | `VARCHAR(64)` | `NOT NULL` | 64-character SHA-256 cryptographic checksum. |
| `category` | `VARCHAR(64)` | `DEFAULT 'Forensic Log'`| Category: `Memory Dump`, `Network Capture`, `System Log`, `Screenshot`. |
| `attestation` | `TEXT` | `NULLABLE` | Legal chain-of-custody statement and acquisition circumstances. |
| `file_path` | `VARCHAR(512)` | `NULLABLE` | Absolute path on backend server / Docker volume. |
| `uploaded_at` | `TIMESTAMP` | `DEFAULT NOW()` | Ingestion timestamp. |
| `uploaded_by` | `VARCHAR(128)` | `DEFAULT 'IT Admin'` | Identity of officer seizing or capturing the evidence. |

### 4.6. `timeline_events` Table (`TimelineEvent` Model)
Immutable, chronological event stream required for DPDP audit disclosures.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY, AUTO` | Unique event ID. |
| `case_id` | `VARCHAR(32)` | `FOREIGN KEY` | Case foreign key. |
| `t` | `VARCHAR(16)` | `NOT NULL` | Human-readable time representation (e.g., `14:05`, `14:05:22 IST`). |
| `a` | `TEXT` | `NOT NULL` | Action description (e.g., `Host isolated from subnet via iptables`). |
| `type` | `VARCHAR(32)` | `DEFAULT 'done'` | UI marker type: `done`, `active`, `pending`, `alert`. |
| `user` | `VARCHAR(128)` | `NULLABLE` | Actor responsible: `Wazuh SIEM`, responder name, or `Automated Playbook`. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Exact database insertion timestamp. |

### 4.7. `alerts` Table (`Alert` Model)
Raw and parsed security anomalies ingested from Wazuh 4.7.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY, AUTO` | Unique alert ID. |
| `rule_id` | `VARCHAR(32)` | `INDEX` | Wazuh rule ID (e.g. `100002`, `5710`). |
| `level` | `INTEGER` | `NOT NULL` | Wazuh severity level (0 to 16). |
| `description` | `TEXT` | `NOT NULL` | Rule title / attack description. |
| `mitre_id` | `VARCHAR(64)` | `NULLABLE` | MITRE technique identifier (e.g. `T1110`). |
| `agent` | `VARCHAR(128)` | `NOT NULL` | Monitored host name. |
| `agent_ip` | `VARCHAR(64)` | `NOT NULL` | Monitored host IP. |
| `source_ip` | `VARCHAR(64)` | `NOT NULL` | Offending/attacker IP. |
| `target_user` | `VARCHAR(64)` | `NULLABLE` | Targeted user account. |
| `threat_type` | `VARCHAR(64)` | `NOT NULL` | Categorized threat taxonomy. |
| `time` | `VARCHAR(64)` | `NOT NULL` | ISO timestamp emitted by SIEM. |
| `raw_payload` | `JSON` | `NULLABLE` | Unaltered Wazuh JSON for deep forensic audit. |
| `linked_case_id`| `VARCHAR(32)` | `NULLABLE` | Associated incident case ID (if case was spawned/updated). |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Ingestion timestamp. |

### 4.8. `org_profile` Table (`OrgProfile` Model)
Institutional compliance metadata for Kumaraguru College of Technology.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY (1)` | Single-row singleton configuration table. |
| `org_name` | `VARCHAR(255)` | `NOT NULL` | Legal entity name (`Kumaraguru College of Technology`). |
| `org_type` | `VARCHAR(64)` | `NOT NULL` | Institutional type (`Higher Education Institution / Data Fiduciary`). |
| `city` | `VARCHAR(64)` | `NOT NULL` | City (`Coimbatore`). |
| `state` | `VARCHAR(64)` | `NOT NULL` | State (`Tamil Nadu`). |
| `registration_id`| `VARCHAR(128)` | `NOT NULL` | Statutory identifier (`EDU-TN-CBE-2026-0042`). |
| `address` | `TEXT` | `NOT NULL` | Official registered campus address. |
| `dpo_name` | `VARCHAR(128)` | `NOT NULL` | Data Protection Officer (`Dr. S. Ramachandran`). |
| `dpo_title` | `VARCHAR(128)` | `NOT NULL` | DPO designation (`Data Protection Officer & Head of IT`). |
| `dpo_email` | `VARCHAR(128)` | `NOT NULL` | DPO contact email (`dpo@kct.ac.in`). |
| `dpo_phone` | `VARCHAR(32)` | `NOT NULL` | DPO official telephone (`+91 422 266 9401`). |
| `it_head_name` | `VARCHAR(128)` | `NOT NULL` | Incident Commander (`Prethiv Raj`). |
| `cert_in_contact`| `VARCHAR(128)` | `NOT NULL` | Statutory CERT-In email address (`incident@cert-in.org.in`). |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Last update timestamp. |

---

## 5. Pydantic Schemas & DTO Layer (`app/schemas.py`)

All request and response shapes are strictly typed with Pydantic V2.

### 5.1. Computed Fields & Dual-Platform Aliasing
To ensure seamless interoperability between the backend, the React frontend, and CLI testing (`jq`), the step models expose dynamic `@computed_field` properties:

```python
class CaseStepOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    step_order: int
    title: str
    phase: str
    plain: str
    linux_cmd: str
    windows_cmd: str
    expected_outcome: str
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None
    notes: Optional[str] = None

    @computed_field
    @property
    def command(self) -> str:
        """Alias returning linux_cmd for curl and automated scripts."""
        return self.linux_cmd

    @computed_field
    @property
    def linux(self) -> str:
        """Alias matching React frontend platform tab."""
        return self.linux_cmd

    @computed_field
    @property
    def windows(self) -> str:
        """Alias matching React frontend platform tab."""
        return self.windows_cmd

    @computed_field
    @property
    def exp(self) -> str:
        """Alias matching React frontend 'What you should see' verification box."""
        return self.expected_outcome
```

### 5.2. Core Data Transfer Objects (DTOs)

| Schema | Purpose | Primary Fields |
|---|---|---|
| `CaseOut` | Full serialization of an incident case | `id`, `title`, `sev`, `status`, `cur_step`, `steps`, `evidence`, `timeline` |
| `CaseCreate` | Manual creation of an incident | `title`, `type`, `sev`, `computer`, `attacker_ip`, `assigned_to`, `persons` |
| `CaseVariablesUpdate` | Saving live target variables from UI | `attacker_ip`, `suspect_pid`, `target_user`, `modified_file`, `c2_ip` |
| `CaseStatusUpdate` | Transitioning incident lifecycle state | `status` (`open`, `in-progress`, `contained`, `resolved`), `status_lbl` |
| `CaseStepUpdate` | Marking a step complete or adding notes | `is_completed`, `completed_by`, `notes` |
| `EvidenceItemOut` | Exposing evidence records with SHA-256 | `id`, `name`, `size`, `sha256`, `category`, `attestation`, `uploaded_at` |
| `PlaybookOut` | Exposing master playbooks | `id`, `name`, `mitre_tag`, `iso_phase`, `steps` |
| `AlertOut` | Serializing ingested security alerts | `id`, `rule_id`, `level`, `description`, `agent`, `source_ip`, `threat_type` |
| `MetricsSummaryOut` | Dashboard summary cards & charts | `total_cases`, `active_cases`, `contained_cases`, `resolved_cases`, `mttd_minutes`, `mttr_minutes`, `severity_breakdown`, `attack_type_breakdown` |
| `SyncResult` | Summary response for Module 1 pull sync | `status`, `synced_alerts_count`, `cases_created_count`, `case_ids` |

---

## 6. Case & Playbook Service Engine (`app/case_service.py`)

### 6.1. `parse_wazuh_alert(data: Dict[str, Any]) -> Dict[str, Any]`
Robust normalizer handling both nested Wazuh 4.7 alert JSON and flat key-value pairs:
1. **Agent Resolution**: Handles `agent` whether it is a dictionary (`{"name": "...", "ip": "..."}`) or a flat string (`"srv-lab-ssh01"`).
2. **Attacker IP Resolution**: Prioritizes `source_ip` → `attacker_ip` → Windows EventData `ipAddress` → Linux syslog `srcip` / `src_ip` → `agent_ip`.
3. **Target User Resolution**: Prioritizes `target_user` → Windows EventData `targetUserName` / `subjectUserName` → `dstuser` → `srcuser`.
4. **Threat Mapping**: Analyzes MITRE tactics, rule descriptions, and groups to classify into one of the four playbooks:
   - Contains `ransomware`, `encrypt`, `vssadmin` → `ransomware`
   - Contains `brute`, `credential`, `4625`, `ssh` → `bruteforce`
   - Contains `privilege`, `sudo`, `4672`, `4728` → `privilege`
   - Contains `syscheck`, `integrity`, `/etc/shadow` → `fileintegrity`
   - Fallback: Level $\ge 12$ $\rightarrow$ `ransomware`; Level $< 12$ $\rightarrow$ `bruteforce`.

### 6.2. `ingest_wazuh_alert(db: Session, raw_payload: Dict[str, Any]) -> Tuple[Alert, Optional[Case]]`
1. Parses alert indicators.
2. Evaluates **5-minute sliding window deduplication**:
   ```python
   existing_case = db.query(Case).filter(
       Case.computer == parsed["agent"],
       Case.attacker_ip == parsed["source_ip"],
       Case.status.in_(["open", "in-progress"]),
       Case.created_at >= (now_utc - timedelta(minutes=5))
   ).first()
   ```
   - If an active case exists within the window: Logs the secondary alert to the `alerts` table and appends an audit event to the existing case's timeline without creating duplicate tickets.
   - If no active case exists: Scans database for highest case ID (`IR-XX`), generates unique identifier (e.g. `IR-11`), clones master playbook steps, interpolates command placeholders, and commits transaction.

### 6.3. `interpolate_command(cmd_template: str, case: Case) -> str`
Performs parameter replacement across both Linux and Windows commands:
- `[ATTACKER_IP]` $\rightarrow$ `case.attacker_ip`
- `[SUSPECT_PID]`, `[PID]` $\rightarrow$ `case.suspect_pid`
- `[TARGET_USER]`, `[SUSPECT_USER]` $\rightarrow$ `case.target_user`
- `[MODIFIED_FILE]`, `[TARGET_PATH]` $\rightarrow$ `case.modified_file`
- `[FILE]` $\rightarrow$ File basename (e.g., `shadow`)
- `[C2_IP]` $\rightarrow$ `case.c2_ip`

### 6.4. `update_case_variables(db: Session, case_id: str, updates: CaseVariablesUpdate) -> Case`
Persists responder-supplied forensic indicators from the dashboard and automatically re-interpolates the commands of all steps in the case, logging an audit record in the timeline.

### 6.5. `attach_evidence_file(...) -> EvidenceItem`
Streams uploaded files to `data/evidence_store/`, calculates SHA-256 hashes via chunked reads (64 KB buffers), and records file size and attestation.

### 6.6. `get_metrics_summary(db: Session) -> MetricsSummaryOut`
Computes institutional KPIs:
- **MTTD (Mean Time to Detect)**: $\frac{1}{N}\sum (\text{detected\_at} - \text{breach\_est\_at})$ in minutes.
- **MTTR (Mean Time to Respond)**: $\frac{1}{N}\sum (\text{contained\_at} - \text{detected\_at})$ in minutes.
- Active, Contained, and Resolved incident totals.

---

## 7. REST API Endpoint Reference (`app/main.py`)

All endpoints are hosted at `http://localhost:8000` (Swagger UI at `/docs`).

### 7.1. Detection & SIEM Ingestion
| Method | Path | Summary | Parameters | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/webhook/wazuh` | Direct push webhook for Wazuh Manager (`integratord`) | Body: Raw or flat alert JSON | `{"status": "success", "alert_id": 4, "case_id": "IR-10"}` |
| `POST` | `/alerts` | Backward-compatible alias for Wazuh webhook | Body: Alert JSON | `{"status": "success", ...}` |
| `POST` | `/api/v1/sync-alerts` | Pull sync from Module 1 Flask service | Query: `module1_url` (optional) | `SyncResult` |
| `GET` | `/api/v1/alerts` | List recently ingested Wazuh alerts | Query: `limit` (default 50) | `List[AlertOut]` |

### 7.2. Incident Case Management
| Method | Path | Summary | Parameters | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/cases` | List all cases with steps and indicators | Query: `status`, `sev`, `q`, `limit`, `offset` | `List[CaseOut]` |
| `GET` | `/cases` | Backward-compatible alias for case queue | Query: Same as above | `List[CaseOut]` |
| `GET` | `/api/v1/cases/{id}`| Retrieve full case details | Path: `id` (e.g. `IR-08`) | `CaseOut` |
| `POST` | `/api/v1/cases` | Manually open a new incident case | Body: `CaseCreate` | `CaseOut` (HTTP 201) |
| `PATCH`| `/api/v1/cases/{id}`| Update live forensic indicators (PID, IP) | Path: `id`, Body: `CaseVariablesUpdate` | `CaseOut` |
| `PATCH`| `/api/v1/cases/{id}/status` | Transition case lifecycle state | Path: `id`, Body: `CaseStatusUpdate` | `CaseOut` |
| `PATCH`| `/api/v1/cases/{id}/steps/{step}` | Mark step complete and log ISO timestamp | Path: `id`, `step`, Body: `CaseStepUpdate` | `CaseOut` |

### 7.3. Forensic Evidence Locker
| Method | Path | Summary | Parameters | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/cases/{id}/evidence` | Upload forensic artifact with SHA-256 hash | Form: `file`, `category`, `notes`, `user` | `EvidenceItemOut` (HTTP 201) |
| `GET` | `/api/v1/cases/{id}/evidence` | List all evidence items attached to case | Path: `id` | `List[EvidenceItemOut]` |

### 7.4. Master Playbooks & Institutional Metrics
| Method | Path | Summary | Parameters | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/playbooks` | List master SOP templates with commands | None | `List[PlaybookOut]` |
| `GET` | `/api/v1/playbooks/{id}` | Get specific master playbook | Path: `id` (`ransomware`, etc.) | `PlaybookOut` |
| `GET` | `/api/v1/metrics/summary` | Aggregate dashboard KPIs (MTTD, MTTR) | None | `MetricsSummaryOut` |
| `GET` | `/api/v1/org-profile` | Get DPO and college profile | None | `OrgProfileOut` |
| `PUT` | `/api/v1/org-profile` | Update DPO and college profile | Body: `OrgProfileUpdate` | `OrgProfileOut` |

### 7.5. Statutory Compliance & Reporting
| Method | Path | Summary | Parameters | Response |
|---|---|---|---|---|
| `POST` | `/reports/generate/{case_id}` | Compile official DPDP Act & CERT-In report | Path: `case_id` | JSON summary + download URL |
| `GET` | `/reports/{case_id}/download` | Stream compiled court-admissible PDF | Path: `case_id` | Binary PDF (`application/pdf`) |
| `GET` | `/reports/{case_id}/preview` | Preview report in responsive HTML | Path: `case_id` | HTML page (`text/html`) |
| `GET` | `/reports/{case_id}/cert-in-email` | Pre-formatted statutory email dispatch | Path: `case_id` | Plain text notice (`text/plain`) |
| `GET` | `/reports` | List all compiled reports on disk | None | JSON file list |
| `GET` | `/health` | Healthcheck (API, DB, WeasyPrint status) | None | JSON health object |

---

## 8. Compliance Reporting Engine (`services/report_generator.py`)

### 8.1. Statutory Mandates Addressed
1. **DPDP Act 2023 Section 8(6)**:
   Mandates that every Data Fiduciary in the event of a personal data breach notify both the **Data Protection Board of India (DPBI)** and each impacted **Data Principal**. The report automatically compiles:
   - Nature, duration, and extent of personal data breach.
   - Specific data categories impacted (e.g., *Student Records*, *Staff Financials*).
   - Estimated count of impacted persons.
   - Remediation and mitigation steps taken.
   - Contact coordinates of the institutional Data Protection Officer.
2. **CERT-In Directions (April 2022 / IT Act §70B)**:
   Mandates reporting of specified cybersecurity incidents within **6 hours** of discovery. The engine dynamically calculates:
   $$\text{Elapsed Hours} = \frac{\text{Current Time} - \text{Detected Time}}{3600}$$
   - Displays a live countdown: `COMPLIANT (Elapsed: 8m, 352m remaining)`.
   - Flags `DEADLINE EXCEEDED` if elapsed time $> 6.0$ hours.

### 8.2. Compilation Process
```
PostgreSQL Database Record (Case, Steps, Evidence, Org)
                      │
                      ▼
 CaseAdapter Normalization & IST Timezone Conversion
                      │
                      ▼
 Jinja2 HTML Rendering (templates/report_template.html)
                      │
                      ▼
 WeasyPrint PDF Engine (CSS Paged Media @page A4)
                      │
                      ▼
 Court-Admissible PDF Archive: data/reports/IR-XX_report.pdf
```

---

## 9. Environment Variables (`.env`)

| Variable | Recommended Value | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://zerorespond:change-me@zerorespond-db:5432/zerorespond` | Connection string for database. |
| `POSTGRES_USER` | `zerorespond` | PostgreSQL username. |
| `POSTGRES_PASSWORD` | `change-me` | PostgreSQL password. |
| `POSTGRES_DB` | `zerorespond` | Target database name. |
| `RUNNING_IN_DOCKER`| `true` | Set inside Docker to retain container hostname. |
| `MODULE_1_URL` | `http://localhost:5000/api/v1/alerts` | URL of Naveen's Module 1 detection service. |
| `ORG_NAME` | `Kumaraguru College of Technology` | Registered institution name for DPDP reports. |
| `ORG_DPO_EMAIL` | `dpo@kct.ac.in` | Data Protection Officer contact email. |
| `CERT_IN_CONTACT` | `incident@cert-in.org.in` | CERT-In statutory dispatch email address. |

---

## 10. Verification & Testing Reference

### Quick Diagnostic Commands

```bash
# 1. Check API & Database Health
curl -s http://localhost:8000/health | jq

# 2. Ingest Sample Wazuh Alert (Opens new case)
curl -s -X POST http://localhost:8000/api/v1/webhook/wazuh \
  -H "Content-Type: application/json" \
  -d '{
    "rule_id": "100002",
    "level": 12,
    "description": "SSH Brute Force Spike",
    "threat_type": "Brute Force",
    "agent": "srv-lab-ssh01",
    "agent_ip": "192.168.1.120",
    "source_ip": "203.0.113.88",
    "target_user": "root"
  }' | jq

# 3. Retrieve Latest Incident with Interpolated Commands
curl -s http://localhost:8000/api/v1/cases | jq '.[0] | {id, title, sev, attacker_ip, first_cmd: .steps[0].command}'

# 4. Update Attacker Indicators (Re-interpolates all steps)
curl -s -X PATCH http://localhost:8000/api/v1/cases/IR-08 \
  -H "Content-Type: application/json" \
  -d '{"attacker_ip": "198.51.100.44", "suspect_pid": "4192"}' | jq '.steps[3].command'

# 5. Compile Statutory DPDP Act Compliance Report
curl -s -X POST http://localhost:8000/reports/generate/IR-08 | jq

# 6. Preview Statutory Plain Text CERT-In Email
curl -s http://localhost:8000/reports/IR-08/cert-in-email
```
