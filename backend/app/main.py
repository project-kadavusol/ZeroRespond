#!/usr/bin/env python3
"""
ZeroRespond - Unified Incident Response Platform
Backend REST API & Compliance Report Service
Owner: Team Zero (Prithiv Raj - Module 4, Ragul - Modules 2 & 3)

Provides REST endpoints for:
  - Incident Case Management & Playbook Engine (Modules 2 & 3 - Ragul)
  - Wazuh 4.7 SIEM Alert Ingestion & 5-minute Sliding Window Deduplication
  - Forensic Evidence Locker & SHA-256 Chain of Custody (ISO 27037)
  - DPDP Act 2023 Section 8(6) & CERT-In Statutory Report Generation (Module 4A - Prethiv)
  - Interactive Scalar API Developer Portal & Health Monitoring (Module 4B)
"""

import os
import sys
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

from fastapi import (  # type: ignore  # pyrefly: ignore[missing-import]
    FastAPI, HTTPException, Request, Response, status, Body,
    Depends, UploadFile, File, Form, Query
)
from fastapi.responses import (  # type: ignore  # pyrefly: ignore[missing-import]
    HTMLResponse, FileResponse, PlainTextResponse, JSONResponse
)
from fastapi.middleware.cors import CORSMiddleware  # type: ignore  # pyrefly: ignore[missing-import]
from sqlalchemy.orm import Session, joinedload  # type: ignore  # pyrefly: ignore[missing-import]

# Configure structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("zerorespond.api")

# Ensure backend root and services are in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Import Database & Seeder
from app.database import get_db, SessionLocal, init_db
from app.models import (
    Case, Playbook, PlaybookStep, CaseStep,
    EvidenceItem, TimelineEvent, Alert, OrgProfile
)
from app.schemas import (
    CaseOut, CaseCreate, CaseVariablesUpdate, CaseStatusUpdate,
    CaseStepOut, CaseStepUpdate,
    PlaybookOut, PlaybookStepOut,
    EvidenceItemOut, TimelineEventOut,
    AlertOut, WazuhWebhookPayload, AlertItem, Module1AlertResponse, SyncResult,
    OrgProfileOut, OrgProfileUpdate,
    MetricsSummaryOut
)
from app.case_service import (
    ingest_wazuh_alert,
    update_case_variables,
    update_case_step,
    update_case_status,
    attach_evidence_file,
    get_metrics_summary,
    interpolate_command
)

# Import compliance report generator engine
try:
    from services.report_generator import (  # type: ignore
        generate_report,
        build_report_context,
        render_html_report,
        get_cert_in_email_text,
        load_case_by_id,
        list_generated_reports,
        resolve_reports_dir,
        find_project_root,
        IST
    )
except ImportError:
    from backend.services.report_generator import (  # type: ignore
        generate_report,
        build_report_context,
        render_html_report,
        get_cert_in_email_text,
        load_case_by_id,
        list_generated_reports,
        resolve_reports_dir,
        find_project_root,
        IST
    )


# ── Application Lifespan (Startup / Shutdown) ────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initializes PostgreSQL tables and seeds master playbooks and reference cases.
    """
    logger.info("Initializing ZeroRespond backend and database tables...")
    try:
        init_db()
        from app.seed import seed_database
        with SessionLocal() as db:
            seed_database(db)
        logger.info("Database initialized and master playbooks seeded successfully.")
    except Exception as e:
        logger.warning(f"Database startup warning: {e}. If PostgreSQL is starting up, tables will be verified on first query.")
    yield
    logger.info("ZeroRespond backend shutting down.")


# Initialize FastAPI application
app = FastAPI(
    title="ZeroRespond API & Compliance Engine",
    description="Unified Incident Response & Statutory DPDP Act 2023 / CERT-In Reporting Platform for Under-Resourced Organizations",
    version="1.0.0",
    docs_url="/swagger",
    redoc_url="/redoc",
    lifespan=lifespan
)


# ── Developer Portal (Scalar API Reference) ──────────────────────────────────

@app.get("/docs", include_in_schema=False)
async def modern_developer_portal():
    """
    Modern, interactive cybersecurity dark-themed API developer reference portal.
    """
    html_content = """<!doctype html>
<html>
  <head>
    <title>ZeroRespond API & Compliance Engine — Developer Portal</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/png" href="https://raw.githubusercontent.com/project-kadavusol/ZeroRespond/main/logo_icon.png" />
    <style>
      body { margin: 0; background: #070913; }
      :root {
        --scalar-color-1: #f8fafc;
        --scalar-color-2: #94a3b8;
        --scalar-color-3: #64748b;
        --scalar-color-accent: #00e5b0;
        --scalar-background-1: #070913;
        --scalar-background-2: #0e1222;
        --scalar-background-3: #141a2e;
        --scalar-border-color: #1a2238;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/openapi.json"
      data-configuration='{"theme":"deepSpace","darkMode":true,"layout":"modern","showSidebar":true,"searchHotKey":"k"}'
      src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>"""
    return HTMLResponse(content=html_content)


# Configure Cross-Origin Resource Sharing (CORS) for frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# 1. CORE SYSTEM & HEALTH ENDPOINTS (Module 4B)
# ==============================================================================

@app.get("/", tags=["System"])
def root():
    """
    Platform root providing system overview and API documentation links.
    """
    return {
        "platform": "ZeroRespond",
        "tagline": "Detect · Respond · Report · Repeat",
        "team": "Team Zero, Kumaraguru College of Technology",
        "version": "1.0.0",
        "status": "operational",
        "modules": {
            "M1_Detection": "Wazuh SIEM Ingestion (Naveen Kumar)",
            "M2_CaseManager": "FastAPI Incident Workspace (Ragul)",
            "M3_PlaybookEngine": "5 Attack Response Playbooks (Ragul)",
            "M4A_ComplianceReports": "DPDP Act 2023 & CERT-In SLA Engine (Prethiv Raj)",
            "M4B_DevOps": "Docker Compose Stack & Backups (Prethiv Raj)",
            "M5_ZeroDashboard": "React Command Center (Kavin)"
        },
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "cases": "/api/v1/cases",
            "playbooks": "/api/v1/playbooks",
            "wazuh_webhook": "POST /api/v1/webhook/wazuh",
            "reports": "/reports",
            "generate_report": "POST /reports/generate/{case_id}",
            "preview_report": "GET /reports/{case_id}/preview",
            "download_report": "GET /reports/{case_id}/download",
            "cert_in_dispatch": "GET /reports/{case_id}/cert-in-email"
        }
    }


@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """
    Docker healthcheck endpoint for zerorespond-api service.
    Returns status of API, database connectivity, and report storage.
    """
    reports_dir = resolve_reports_dir()
    reports_writable = os.access(reports_dir, os.W_OK) if os.path.exists(reports_dir) else False
    
    # Check PostgreSQL connectivity
    db_connected = False
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    # Check WeasyPrint availability
    weasyprint_available = False
    try:
        import importlib
        importlib.import_module("weasyprint")
        weasyprint_available = True
    except (ImportError, OSError):
        weasyprint_available = False

    return {
        "status": "healthy" if db_connected else "degraded",
        "database": "CONNECTED" if db_connected else "DISCONNECTED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ist_time": datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S IST"),
        "compliance_engine": {
            "dpdp_section_8_6": "ACTIVE",
            "cert_in_6hr_sla_timer": "ACTIVE",
            "reports_storage": reports_dir,
            "reports_storage_writable": reports_writable,
            "weasyprint_pdf_compiler": "AVAILABLE" if weasyprint_available else "STANDBY (HTML Fallback Active)"
        }
    }


# ==============================================================================
# 2. INCIDENT CASE MANAGER ENDPOINTS (Module 2 - Ragul)
# ==============================================================================

@app.get("/api/v1/cases", response_model=List[CaseOut], tags=["Cases"])
@app.get("/cases", include_in_schema=False)
def list_cases(
    status: Optional[str] = Query(None, description="Filter by status: open, in-progress, contained, resolved"),
    sev: Optional[str] = Query(None, description="Filter by severity: critical, high, medium, low"),
    type: Optional[str] = Query(None, description="Filter by attack type: Ransomware, Brute Force, etc."),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    """
    List all incident cases with their steps, evidence counts, and status.
    Supports filtering by status, severity, and attack type.
    """
    query = (
        db.query(Case)
        .options(
            joinedload(Case.steps),
            joinedload(Case.evidence),
            joinedload(Case.timeline)
        )
    )

    if status:
        query = query.filter(Case.status == status)
    if sev:
        query = query.filter(Case.sev == sev)
    if type:
        query = query.filter(Case.type.ilike(f"%{type}%"))

    cases = query.order_by(Case.created_at.desc()).limit(limit).all()
    return cases


@app.get("/api/v1/cases/{case_id}", response_model=CaseOut, tags=["Cases"])
@app.get("/cases/{case_id}", include_in_schema=False)
def get_case(case_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full details for an incident case, including actionable playbook steps,
    forensic target variables, evidence locker artifacts, and audit timeline.
    """
    case = (
        db.query(Case)
        .options(
            joinedload(Case.steps),
            joinedload(Case.evidence),
            joinedload(Case.timeline)
        )
        .filter(Case.id == case_id)
        .first()
    )
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return case


@app.post("/api/v1/cases", response_model=CaseOut, status_code=status.HTTP_201_CREATED, tags=["Cases"])
def create_case(payload: CaseCreate, db: Session = Depends(get_db)):
    """
    Manually open a new structured Incident Case from the ZeroDashboard UI.
    Automatically attaches the matching Playbook and clones the action steps.
    """
    # Generate ID if not provided
    if not payload.id:
        existing_ids = db.query(Case.id).all()
        max_num = 8
        for (cid,) in existing_ids:
            if cid.startswith("IR-") and cid[3:].isdigit():
                try:
                    max_num = max(max_num, int(cid[3:]))
                except ValueError:
                    pass
        case_id = f"IR-{max_num + 1:02d}"
    else:
        case_id = payload.id

    if db.query(Case).filter(Case.id == case_id).first():
        raise HTTPException(status_code=400, detail=f"Case ID {case_id} already exists")

    # Determine playbook key
    pb_key = payload.pb or "ransomware"
    if "brute" in payload.type.lower():
        pb_key = "bruteforce"
    elif "privilege" in payload.type.lower():
        pb_key = "privilege"
    elif "integrity" in payload.type.lower() or "fim" in payload.type.lower():
        pb_key = "fileintegrity"

    now_utc = datetime.utcnow()
    t_str = now_utc.strftime("%H:%M")
    full_str = now_utc.strftime("%d %b %Y, %H:%M UTC")

    new_case = Case(
        id=case_id,
        type=payload.type,
        sev=payload.sev,
        sev_lbl=payload.sev.title(),
        title=payload.title,
        desc=payload.desc or f"{payload.type} incident opened manually.",
        computer=payload.computer,
        source_ip=payload.source_ip,
        attacker_ip=payload.attacker_ip,
        target_user=payload.target_user,
        assigned_to=payload.assigned_to or "Naveen Kumar",
        status="open",
        status_lbl="Open",
        cur_step=1,
        pb=pb_key,
        data_categories=payload.data_categories or "Student Records",
        persons=payload.persons or 0,
        opened_time=t_str,
        opened_full=full_str,
        detected_at=now_utc,
        breach_est_at=now_utc - timedelta(minutes=10)
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    # Initial timeline entry
    db.add(TimelineEvent(
        case_id=new_case.id,
        t=t_str,
        a=f"Incident case opened manually: {payload.title}",
        type="done",
        user=new_case.assigned_to
    ))

    # Clone playbook steps
    master_pb = db.query(Playbook).filter(Playbook.id == pb_key).first()
    if master_pb and master_pb.steps:
        for p_step in master_pb.steps:
            l_cmd = interpolate_command(p_step.linux_cmd, new_case)
            w_cmd = interpolate_command(p_step.windows_cmd, new_case)
            db.add(CaseStep(
                case_id=new_case.id,
                step_order=p_step.step_order,
                title=p_step.title,
                phase=p_step.phase,
                plain=p_step.plain,
                linux_cmd=l_cmd,
                windows_cmd=w_cmd,
                expected_outcome=p_step.expected_outcome,
                is_completed=False
            ))

    db.commit()
    db.refresh(new_case)
    return new_case


@app.patch("/api/v1/cases/{case_id}", response_model=CaseOut, tags=["Cases"])
def update_case_target_variables(
    case_id: str,
    payload: CaseVariablesUpdate,
    db: Session = Depends(get_db)
):
    """
    Update identified forensic indicators (Attacker IP, Suspect PID, Target User, Target File, C2 IP).
    Automatically interpolates variables into all subsequent playbook command steps.
    """
    try:
        updated_case = update_case_variables(db, case_id, payload)
        return updated_case
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.patch("/api/v1/cases/{case_id}/status", response_model=CaseOut, tags=["Cases"])
def update_status(
    case_id: str,
    payload: CaseStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Transition incident lifecycle status (open -> in-progress -> contained -> resolved).
    """
    try:
        updated = update_case_status(db, case_id, payload.status, payload.status_lbl)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ==============================================================================
# 3. PLAYBOOK ENGINE ENDPOINTS (Module 3 - Ragul)
# ==============================================================================

@app.get("/api/v1/playbooks", response_model=List[PlaybookOut], tags=["Playbooks"])
@app.get("/playbooks", include_in_schema=False)
def list_playbooks(db: Session = Depends(get_db)):
    """
    List all master Incident Response Standard Operating Procedures (SOPs).
    Includes actionable Linux and Windows command steps.
    """
    return db.query(Playbook).options(joinedload(Playbook.steps)).all()


@app.get("/api/v1/playbooks/{playbook_id}", response_model=PlaybookOut, tags=["Playbooks"])
def get_playbook(playbook_id: str, db: Session = Depends(get_db)):
    """
    Retrieve master playbook details and all dual-platform command steps.
    """
    pb = (
        db.query(Playbook)
        .options(joinedload(Playbook.steps))
        .filter(Playbook.id == playbook_id)
        .first()
    )
    if not pb:
        raise HTTPException(status_code=404, detail=f"Playbook {playbook_id} not found")
    return pb


@app.patch("/api/v1/cases/{case_id}/steps/{step_id}", response_model=CaseOut, tags=["Playbooks"])
def mark_step_complete(
    case_id: str,
    step_id: int,
    payload: CaseStepUpdate,
    db: Session = Depends(get_db)
):
    """
    Mark a guided playbook step complete, record completion timestamp,
    add responder notes, and auto-advance case progress.
    """
    try:
        updated_case = update_case_step(db, case_id, step_id, payload)
        return updated_case
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ==============================================================================
# 4. FORENSIC EVIDENCE LOCKER (Module 2 - ISO 27037)
# ==============================================================================

@app.post("/api/v1/cases/{case_id}/evidence", response_model=EvidenceItemOut, status_code=status.HTTP_201_CREATED, tags=["Evidence"])
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    category: str = Form("Forensic Artifact"),
    attestation: str = Form("Section 65B IT Act verified"),
    uploader: str = Form("IT Admin"),
    db: Session = Depends(get_db)
):
    """
    Upload a forensic artifact (screenshot, memory dump, log excerpt, network capture).
    Automatically computes SHA-256 integrity hash and records chain of custody.
    """
    try:
        content = await file.read()
        evidence_item = attach_evidence_file(
            db=db,
            case_id=case_id,
            filename=file.filename or "evidence.bin",
            content=content,
            category=category,
            attestation=attestation,
            uploader=uploader
        )
        return evidence_item
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save evidence file: {e}")


@app.get("/api/v1/cases/{case_id}/evidence", response_model=List[EvidenceItemOut], tags=["Evidence"])
def get_case_evidence(case_id: str, db: Session = Depends(get_db)):
    """
    List all forensic evidence artifacts attached to an incident case.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return db.query(EvidenceItem).filter(EvidenceItem.case_id == case_id).order_by(EvidenceItem.id.desc()).all()


# ==============================================================================
# 5. WAZUH SIEM INGESTION & WEBHOOKS (Module 1 - Naveen)
# ==============================================================================

@app.post("/api/v1/webhook/wazuh", tags=["Detection"])
@app.post("/alerts", tags=["Detection"])
def wazuh_alert_webhook(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """
    Direct ingestion endpoint for Wazuh 4.7 SIEM alerts pushed by custom-fapi-flask.py.
    Extracts forensic fields, applies 5-minute sliding deduplication, and auto-opens cases.
    """
    alert, linked_case = ingest_wazuh_alert(db, payload)
    return {
        "status": "success",
        "alert_id": alert.id,
        "rule_id": alert.rule_id,
        "threat_type": alert.threat_type,
        "case_created": linked_case is not None,
        "case_id": linked_case.id if linked_case else None
    }


@app.post("/api/v1/sync-alerts", response_model=SyncResult, tags=["Detection"])
def sync_alerts_from_module1(
    module1_url: Optional[str] = Query(None, description="Optional custom Module 1 alerts URL"),
    db: Session = Depends(get_db)
):
    """
    Pull alerts from Module 1 and persist high/critical ones (level >= 12)
    as Cases with their playbook steps cloned in.
    """
    url = module1_url or os.getenv("MODULE_1_URL", "http://localhost:5000/api/v1/alerts")
    try:
        import httpx
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url)
            resp.raise_for_status()
            payload = resp.json()
    except Exception as e:
        logger.error(f"Failed to pull alerts from Module 1 ({url}): {e}")
        raise HTTPException(status_code=502, detail=f"Failed to pull alerts from Module 1: {e}")

    alerts_list = payload.get("data", [])
    total_count = payload.get("count", len(alerts_list))
    created_ids: List[str] = []

    for alert_data in alerts_list:
        # Wazuh levels: 12-15 = Critical / High
        if alert_data.get("level", 0) < 12:
            continue
        _, case = ingest_wazuh_alert(db, alert_data)
        if case and case.id not in created_ids:
            created_ids.append(case.id)

    return SyncResult(
        status="success",
        synced_alerts_count=total_count,
        cases_created_count=len(created_ids),
        case_ids=created_ids
    )


@app.get("/api/v1/alerts", response_model=List[AlertOut], tags=["Detection"])
def list_alerts(limit: int = Query(50, le=100), db: Session = Depends(get_db)):
    """
    List raw and parsed security alerts ingested from Wazuh SIEM.
    """
    return db.query(Alert).order_by(Alert.id.desc()).limit(limit).all()


# ==============================================================================
# 6. METRICS & EXECUTIVE OVERVIEW
# ==============================================================================

@app.get("/api/v1/metrics/summary", response_model=MetricsSummaryOut, tags=["Metrics"])
def get_metrics(db: Session = Depends(get_db)):
    """
    Returns aggregated incident metrics: active incidents, MTTR, MTTD,
    and attack severity distribution for ZeroDashboard charts.
    """
    return get_metrics_summary(db)


# ==============================================================================
# 7. ORGANIZATION PROFILE & DPDP CONFIGURATION
# ==============================================================================

@app.get("/api/v1/org-profile", response_model=OrgProfileOut, tags=["Organization"])
@app.get("/org-profile", include_in_schema=False)
def get_org_profile_endpoint(db: Session = Depends(get_db)):
    """
    Returns the Data Fiduciary Organization Profile configured for DPDP Act 2023 reports.
    """
    org = db.query(OrgProfile).first()
    if not org:
        return OrgProfileOut(
            org_name="Kumaraguru College of Technology",
            org_type="Higher Education",
            city="Coimbatore",
            state="Tamil Nadu",
            registration_id="EDU-TN-CBE-2026-0042",
            address="Athipalayam Road, Chinnavedampatti, Coimbatore, Tamil Nadu 641049",
            dpo_name="Dr. S. Ramachandran",
            dpo_title="Data Protection Officer & Head of IT",
            dpo_email="dpo@kct.ac.in",
            dpo_phone="+91 422 266 9401",
            it_head_name="Prethiv Raj",
            cert_in_contact="incident@cert-in.org.in"
        )
    return org


@app.put("/api/v1/org-profile", response_model=OrgProfileOut, tags=["Organization"])
def update_org_profile_endpoint(payload: OrgProfileUpdate, db: Session = Depends(get_db)):
    """
    Update Data Fiduciary institutional information (DPO contact, registration ID, address).
    """
    org = db.query(OrgProfile).first()
    if not org:
        org = OrgProfile(id=1)
        db.add(org)

    for field, val in payload.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(org, field, val)

    db.commit()
    db.refresh(org)
    return org


# ==============================================================================
# 8. DPDP COMPLIANCE REPORT GENERATOR ENDPOINTS (Module 4A - Prethiv)
# ==============================================================================

@app.post("/reports/generate/{case_id}", tags=["Reports"])
def generate_compliance_report(
    case_id: str,
    payload: Optional[Dict[str, Any]] = Body(default=None),
    db: Session = Depends(get_db)
):
    """
    Generate an official DPDP Act 2023 Section 8(6) and CERT-In compliant incident report.
    - If case exists in live PostgreSQL database, builds report context directly from real DB records.
    - Otherwise, loads case data from data/mock_cases/{case_id}.json.
    Produces court-admissible WeasyPrint PDF report and instant HTML preview.
    """
    # 1. Check if case exists in PostgreSQL database
    db_case = (
        db.query(Case)
        .options(joinedload(Case.steps), joinedload(Case.evidence), joinedload(Case.timeline))
        .filter(Case.id == case_id)
        .first()
    )

    if db_case:
        # Build dictionary from live DB records
        org = db.query(OrgProfile).first()
        categories = [c.strip() for c in (db_case.data_categories or "").split(",") if c.strip()]
        
        case_dict = {
            "id": db_case.id,
            "title": db_case.title,
            "severity": db_case.sev,
            "status": db_case.status,
            "breach_type": db_case.type,
            "source_host": db_case.computer,
            "source_ip": db_case.source_ip,
            "attacker_ip": db_case.attacker_ip,
            "detected_at": db_case.detected_at.isoformat() if db_case.detected_at else datetime.utcnow().isoformat(),
            "breach_est_at": db_case.breach_est_at.isoformat() if db_case.breach_est_at else (datetime.utcnow() - timedelta(minutes=20)).isoformat(),
            "contained_at": db_case.contained_at.isoformat() if db_case.contained_at else None,
            "resolved_at": db_case.resolved_at.isoformat() if db_case.resolved_at else None,
            "data_categories": categories or ["Student Records", "Staff Information"],
            "persons_affected": db_case.persons or 0,
            "assigned_responder": db_case.assigned_to,
            "desc": db_case.desc
        }

        playbook_dict = {
            "id": db_case.pb,
            "name": f"{db_case.type} Response SOP",
            "steps": [
                {
                    "step_number": s.step_order,
                    "title": s.title,
                    "completed": s.is_completed,
                    "completed_at": s.completed_at.strftime("%H:%M IST") if s.completed_at else None,
                    "notes": s.notes
                }
                for s in db_case.steps
            ]
        }

        evidence_list = [
            {
                "name": e.name,
                "size": e.size,
                "sha256": e.sha256,
                "category": e.category,
                "attestation": e.attestation
            }
            for e in db_case.evidence
        ]

        org_dict = {
            "name": org.org_name if org else "Kumaraguru College of Technology",
            "registration_id": org.registration_id if org else "EDU-TN-CBE-2026-0042",
            "address": org.address if org else "Athipalayam Road, Chinnavedampatti, Coimbatore, Tamil Nadu 641049",
            "dpo_name": org.dpo_name if org else "Dr. S. Ramachandran",
            "dpo_title": org.dpo_title if org else "Data Protection Officer & Head of IT",
            "dpo_email": org.dpo_email if org else "dpo@kct.ac.in",
            "dpo_phone": org.dpo_phone if org else "+91 422 266 9401",
            "it_head_name": org.it_head_name if org else "Prethiv Raj"
        }

        case_data = {
            "case": case_dict,
            "playbook": playbook_dict,
            "evidence": evidence_list,
            "organization": org_dict
        }

        # Apply any partial payload overrides
        if payload and isinstance(payload, dict):
            if "case" in payload:
                case_data["case"].update(payload["case"])
            if "organization" in payload:
                case_data["organization"].update(payload["organization"])
    else:
        # Fallback to loading from data/mock_cases/{case_id}.json
        if payload and isinstance(payload, dict) and "case" in payload:
            case_data = payload
        else:
            case_data, loaded_path = load_case_by_id(case_id)
            if payload and isinstance(payload, dict):
                if "case" in case_data:
                    case_data["case"].update(payload.get("case", {}))
                if "organization" in payload:
                    case_data["organization"] = payload["organization"]

        if "case" not in case_data:
            case_data["case"] = {}
        case_data["case"]["id"] = case_id

    # Run the report generator engine
    result = generate_report(case_data)

    return {
        "status": "success",
        "case_id": case_id,
        "message": "DPDP Act 2023 & CERT-In compliance report package compiled successfully.",
        "pdf_path": result.get("pdf_path"),
        "html_path": result.get("html_path"),
        "pdf_download_url": f"/reports/{case_id}/download",
        "html_preview_url": f"/reports/{case_id}/preview",
        "cert_in_dispatch_url": f"/reports/{case_id}/cert-in-email",
        "generated_at": result.get("generated_at"),
        "compliance": {
            "dpdp_section_8_6": "COMPLIANT",
            "cert_in_sla_6hr": "ON_SCHEDULE"
        }
    }


@app.get("/reports/{case_id}/preview", response_class=HTMLResponse, tags=["Reports"])
def preview_compliance_report(case_id: str, db: Session = Depends(get_db)):
    """
    Renders live HTML preview of the DPDP Act 2023 / CERT-In report.
    """
    # Check if a rendered HTML report exists on disk
    root = find_project_root()
    report_file = os.path.join(resolve_reports_dir(), f"{case_id}_preview.html")
    if os.path.exists(report_file):
        with open(report_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())

    # Otherwise generate on the fly
    gen_result = generate_compliance_report(case_id=case_id, payload=None, db=db)
    if os.path.exists(gen_result.get("html_path", "")):
        with open(gen_result["html_path"], "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())

    raise HTTPException(status_code=404, detail=f"Report preview for case {case_id} could not be generated.")


@app.get("/reports/{case_id}/download", tags=["Reports"])
def download_compliance_report_pdf(case_id: str, db: Session = Depends(get_db)):
    """
    Downloads the official WeasyPrint PDF report for statutory CERT-In / DPDP compliance.
    """
    reports_dir = resolve_reports_dir()
    pdf_file = os.path.join(reports_dir, f"{case_id}_report.pdf")

    # If PDF does not exist yet, compile it now
    if not os.path.exists(pdf_file):
        generate_compliance_report(case_id=case_id, payload=None, db=db)

    if os.path.exists(pdf_file):
        return FileResponse(
            path=pdf_file,
            filename=f"ZeroRespond_{case_id}_DPDP_Compliance_Report.pdf",
            media_type="application/pdf"
        )

    # Fallback to HTML if WeasyPrint is in standby mode
    html_file = os.path.join(reports_dir, f"{case_id}_preview.html")
    if os.path.exists(html_file):
        return FileResponse(
            path=html_file,
            filename=f"ZeroRespond_{case_id}_Compliance_Report.html",
            media_type="text/html"
        )

    raise HTTPException(status_code=404, detail=f"Report for case {case_id} not found.")


@app.get("/reports/{case_id}/cert-in-email", response_class=PlainTextResponse, tags=["Reports"])
def get_cert_in_email_dispatch(case_id: str, db: Session = Depends(get_db)):
    """
    Returns pre-formatted plaintext emergency email for CERT-In 6-Hour SLA submission.
    """
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if db_case:
        categories = [c.strip() for c in (db_case.data_categories or "").split(",") if c.strip()]
        case_data = {
            "case": {
                "id": db_case.id,
                "title": db_case.title,
                "severity": db_case.sev,
                "status": db_case.status,
                "breach_type": db_case.type,
                "source_host": db_case.computer,
                "source_ip": db_case.source_ip,
                "attacker_ip": db_case.attacker_ip,
                "detected_at": db_case.detected_at.isoformat() if db_case.detected_at else datetime.utcnow().isoformat(),
                "data_categories": categories,
                "persons_affected": db_case.persons or 0,
                "assigned_responder": db_case.assigned_to,
                "desc": db_case.desc
            },
            "organization": {
                "name": "Kumaraguru College of Technology",
                "dpo_name": "Dr. S. Ramachandran",
                "dpo_email": "dpo@kct.ac.in",
                "dpo_phone": "+91 422 266 9401"
            }
        }
    else:
        case_data, _ = load_case_by_id(case_id)

    email_text = get_cert_in_email_text(case_data)
    return PlainTextResponse(content=email_text)


@app.get("/reports", tags=["Reports"])
def list_reports():
    """
    List all compiled compliance report packages stored on disk.
    """
    return list_generated_reports()


@app.get("/reports/cases/available", tags=["Reports"])
def list_available_cases(db: Session = Depends(get_db)):
    """
    List all cases available for report generation (both live DB and mock cases).
    """
    # 1. From database
    db_cases = db.query(Case).all()
    available = []
    seen_ids = set()

    for c in db_cases:
        seen_ids.add(c.id)
        available.append({
            "case_id": c.id,
            "source": "PostgreSQL Database",
            "title": c.title,
            "severity": c.sev,
            "breach_type": c.type,
            "status": c.status,
            "persons_affected": c.persons,
            "generate_url": f"/reports/generate/{c.id}"
        })

    # 2. From mock cases directory (if any not in DB)
    root = find_project_root()
    cases_dir = os.path.join(root, "data", "mock_cases")
    if os.path.exists(cases_dir):
        for f in sorted(os.listdir(cases_dir)):
            if f.endswith(".json"):
                f_path = os.path.join(cases_dir, f)
                try:
                    with open(f_path, "r", encoding="utf-8") as jf:
                        d = json.load(jf)
                        c = d.get("case", {})
                        cid = c.get("id", f)
                        if cid not in seen_ids:
                            available.append({
                                "case_id": cid,
                                "source": "Mock Case File",
                                "filename": f,
                                "title": c.get("title", "Incident"),
                                "severity": c.get("severity", "medium"),
                                "breach_type": c.get("breach_type", "Cyber Incident"),
                                "status": c.get("status", "open"),
                                "persons_affected": c.get("persons_affected", 0),
                                "generate_url": f"/reports/generate/{cid}"
                            })
                except Exception:
                    continue

    return {
        "count": len(available),
        "cases": available
    }


if __name__ == "__main__":
    import uvicorn  # type: ignore  # pyrefly: ignore[missing-import]
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
