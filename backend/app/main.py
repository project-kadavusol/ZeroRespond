#!/usr/bin/env python3
"""
ZeroRespond - Unified Incident Response Platform
Backend REST API & Compliance Report Service
Owner: Team Zero (Prithiv Raj - Module 4, Ragul - Modules 2 & 3)

Provides REST endpoints for:
  - DPDP Act 2023 Section 8(6) & CERT-In Compliance Report Generation (Module 4A)
  - Report downloads (PDF / HTML preview) and Statutory CERT-In Dispatches
  - Incident Case Management and Playbooks (Modules 2 & 3)
  - Health checks & system monitoring (Module 4B)
"""

import os
import sys
import json
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, HTTPException, Request, Response, status, Body  # type: ignore  # pyrefly: ignore[missing-import]
from fastapi.responses import HTMLResponse, FileResponse, PlainTextResponse, JSONResponse  # type: ignore  # pyrefly: ignore[missing-import]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore  # pyrefly: ignore[missing-import]

# Ensure backend root and services are in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

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

# Initialize FastAPI application
app = FastAPI(
    title="ZeroRespond API & Compliance Engine",
    description="Incident Response & Statutory DPDP Act 2023 / CERT-In Reporting Platform for Under-Resourced Organizations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

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
            "M4A_ComplianceReports": "DPDP Act 2023 & CERT-In SLA Engine (Prithiv Raj)",
            "M4B_DevOps": "Docker Compose Stack & Backups (Prithiv Raj)",
            "M5_ZeroDashboard": "React Command Center (Kavin)"
        },
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "reports": "/reports",
            "generate_report": "POST /reports/generate/{case_id}",
            "preview_report": "GET /reports/{case_id}/preview",
            "download_report": "GET /reports/{case_id}/download",
            "cert_in_dispatch": "GET /reports/{case_id}/cert-in-email"
        }
    }


@app.get("/health", tags=["System"])
def health_check():
    """
    Docker healthcheck endpoint for zerorespond-api service.
    Returns status of API, report storage directory, and compliance engine.
    """
    reports_dir = resolve_reports_dir()
    reports_writable = os.access(reports_dir, os.W_OK) if os.path.exists(reports_dir) else False
    
    # Check if WeasyPrint is available
    weasyprint_available = False
    try:
        import importlib
        importlib.import_module("weasyprint")
        weasyprint_available = True
    except (ImportError, OSError):
        weasyprint_available = False

    return {
        "status": "healthy",
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
# 2. DPDP COMPLIANCE REPORT GENERATOR ENDPOINTS (Module 4A)
# ==============================================================================

@app.post("/reports/generate/{case_id}", tags=["Reports"])
def generate_compliance_report(
    case_id: str,
    payload: Optional[Dict[str, Any]] = Body(default=None)
):
    """
    Generate an official DPDP Act 2023 Section 8(6) and CERT-In compliant incident report.
    - If payload is provided in request body, uses it as the case data.
    - Otherwise, loads case data from data/mock_cases/{case_id}.json.
    Produces court-admissible PDF report and instant HTML preview.
    """
    if payload and isinstance(payload, dict) and "case" in payload:
        case_data = payload
    else:
        case_data, loaded_path = load_case_by_id(case_id)
        # If payload was given with partial case overrides, merge them
        if payload and isinstance(payload, dict):
            if "case" in case_data:
                case_data["case"].update(payload.get("case", {}))
            if "organization" in payload:
                case_data["organization"] = payload["organization"]

    # Ensure case ID is set properly
    if "case" not in case_data:
        case_data["case"] = {}
    case_data["case"]["id"] = case_id

    # Run the report generator engine
    result = generate_report(case_data)

    return {
        "status": "success",
        "case_id": case_id,
        "pdf_generated": result.get("pdf_generated", False),
        "message": result.get("message"),
        "mttd": result.get("mttd"),
        "mttr": result.get("mttr"),
        "cert_in_sla_status": result.get("cert_in_sla_status"),
        "cert_in_sla_elapsed": result.get("cert_in_sla_elapsed"),
        "generated_at_ist": result.get("generated_at_ist"),
        "links": {
            "preview_url": f"/reports/{case_id}/preview",
            "download_url": f"/reports/{case_id}/download",
            "cert_in_email_url": f"/reports/{case_id}/cert-in-email"
        },
        "files": {
            "preview_path": result.get("preview_path"),
            "pdf_path": result.get("pdf_path")
        }
    }


@app.post("/reports/generate", tags=["Reports"])
def generate_custom_report(payload: Dict[str, Any] = Body(...)):
    """
    Generate a compliance report directly from a full incident JSON payload.
    """
    case_id = payload.get("case", {}).get("id") or f"ZR-{datetime.now().strftime('%Y%m%d%H%M')}"
    payload.setdefault("case", {})["id"] = case_id
    
    result = generate_report(payload)
    return {
        "status": "success",
        "case_id": case_id,
        "pdf_generated": result.get("pdf_generated", False),
        "message": result.get("message"),
        "mttd": result.get("mttd"),
        "mttr": result.get("mttr"),
        "cert_in_sla_status": result.get("cert_in_sla_status"),
        "cert_in_sla_elapsed": result.get("cert_in_sla_elapsed"),
        "generated_at_ist": result.get("generated_at_ist"),
        "links": {
            "preview_url": f"/reports/{case_id}/preview",
            "download_url": f"/reports/{case_id}/download",
            "cert_in_email_url": f"/reports/{case_id}/cert-in-email"
        }
    }


@app.get("/reports", tags=["Reports"])
def list_reports():
    """
    List all generated reports in the reports vault.
    Returns case IDs, timestamps, file sizes, and download/preview links.
    """
    reports = list_generated_reports()
    # Enrich with API URLs
    enriched = []
    for r in reports:
        c_id = r["case_id"]
        enriched.append({
            **r,
            "preview_url": f"/reports/{c_id}/preview",
            "download_url": f"/reports/{c_id}/download",
            "cert_in_email_url": f"/reports/{c_id}/cert-in-email"
        })
    return {
        "count": len(enriched),
        "reports": enriched
    }


@app.api_route("/reports/{case_id}/preview", methods=["GET", "HEAD"], tags=["Reports"])
def preview_report_html(case_id: str):
    """
    View the rendered HTML incident report preview in browser.
    If the preview file does not exist, generates it dynamically.
    """
    target_dir = resolve_reports_dir()
    preview_file = os.path.join(target_dir, f"{case_id}_preview.html")

    # Case-insensitive lookup fallback on Linux
    if not os.path.exists(preview_file) and os.path.exists(target_dir):
        for f in os.listdir(target_dir):
            if f.lower() == f"{case_id.lower()}_preview.html":
                preview_file = os.path.join(target_dir, f)
                break

    if not os.path.exists(preview_file):
        # Generate on the fly
        case_data, _ = load_case_by_id(case_id)
        generate_report(case_data, preview_only=True)

    # Check again
    if not os.path.exists(preview_file) and os.path.exists(target_dir):
        for f in os.listdir(target_dir):
            if f.lower() == f"{case_id.lower()}_preview.html":
                preview_file = os.path.join(target_dir, f)
                break

    if not os.path.exists(preview_file):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report preview for case '{case_id}' could not be generated."
        )

    with open(preview_file, "r", encoding="utf-8") as f:
        html_content = f.read()

    return HTMLResponse(content=html_content)


@app.api_route("/reports/{case_id}/download", methods=["GET", "HEAD"], tags=["Reports"])
def download_report(case_id: str):
    """
    Download the official compliance report.
    Serves the compiled PDF file if available.
    If PDF is not present, serves the HTML report file so the user is never blocked.
    """
    target_dir = resolve_reports_dir()
    pdf_file = os.path.join(target_dir, f"{case_id}_report.pdf")
    preview_file = os.path.join(target_dir, f"{case_id}_preview.html")

    def find_case_insensitive(filename):
        if os.path.exists(os.path.join(target_dir, filename)):
            return os.path.join(target_dir, filename)
        if os.path.exists(target_dir):
            target_lower = filename.lower()
            for f in os.listdir(target_dir):
                if f.lower() == target_lower:
                    return os.path.join(target_dir, f)
        return None

    resolved_pdf = find_case_insensitive(f"{case_id}_report.pdf")
    resolved_preview = find_case_insensitive(f"{case_id}_preview.html")

    # If PDF exists, serve it
    if resolved_pdf and os.path.exists(resolved_pdf):
        return FileResponse(
            path=resolved_pdf,
            media_type="application/pdf",
            filename=f"ZeroRespond_{case_id}_Compliance_Report.pdf"
        )

    # Try generating if preview or PDF missing
    if not resolved_preview or not os.path.exists(resolved_preview):
        case_data, _ = load_case_by_id(case_id)
        generate_report(case_data)
        resolved_pdf = find_case_insensitive(f"{case_id}_report.pdf")
        resolved_preview = find_case_insensitive(f"{case_id}_preview.html")

    # Check again after generation attempt
    if resolved_pdf and os.path.exists(resolved_pdf):
        return FileResponse(
            path=resolved_pdf,
            media_type="application/pdf",
            filename=f"ZeroRespond_{case_id}_Compliance_Report.pdf"
        )

    # If PDF still not generated (e.g. host missing WeasyPrint), serve HTML
    if resolved_preview and os.path.exists(resolved_preview):
        return FileResponse(
            path=resolved_preview,
            media_type="text/html",
            filename=f"ZeroRespond_{case_id}_Compliance_Report.html"
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Report file for case '{case_id}' not found."
    )


@app.get("/reports/{case_id}/cert-in-email", tags=["Reports"])
def get_cert_in_dispatch(case_id: str):
    """
    Returns the ready-to-dispatch plain text CERT-In emergency notification draft
    formatted specifically for incident@cert-in.org.in under DPDP Section 8(6).
    """
    case_data, _ = load_case_by_id(case_id)
    email_text = get_cert_in_email_text(case_data)
    return PlainTextResponse(content=email_text)


@app.get("/reports/cases/available", tags=["Reports"])
def list_available_cases():
    """
    List all available mock cases from data/mock_cases/ that can be generated.
    """
    root = find_project_root()
    cases_dir = os.path.join(root, "data", "mock_cases")
    available = []

    if os.path.exists(cases_dir):
        for f in sorted(os.listdir(cases_dir)):
            if f.endswith(".json"):
                f_path = os.path.join(cases_dir, f)
                try:
                    with open(f_path, "r", encoding="utf-8") as jf:
                        d = json.load(jf)
                        c = d.get("case", {})
                        available.append({
                            "case_id": c.get("id", f),
                            "filename": f,
                            "title": c.get("title", "Incident"),
                            "severity": c.get("severity", "medium"),
                            "breach_type": c.get("breach_type", "Cyber Incident"),
                            "status": c.get("status", "open"),
                            "persons_affected": c.get("persons_affected", 0),
                            "generate_url": f"/reports/generate/{c.get('id', f)}"
                        })
                except Exception:
                    continue

    return {
        "count": len(available),
        "cases": available
    }


# ==============================================================================
# 3. CASE & PLAYBOOK DATA STUBS (Modules 2 & 3 Support for Frontend)
# ==============================================================================

@app.get("/cases", tags=["Cases"])
def get_cases():
    """
    Returns active and resolved cases for the ZeroDashboard UI.
    """
    root = find_project_root()
    cases_dir = os.path.join(root, "data", "mock_cases")
    cases = []

    if os.path.exists(cases_dir):
        for f in sorted(os.listdir(cases_dir)):
            if f.endswith(".json"):
                f_path = os.path.join(cases_dir, f)
                try:
                    with open(f_path, "r", encoding="utf-8") as jf:
                        d = json.load(jf)
                        if "case" in d:
                            cases.append(d["case"])
                except Exception:
                    continue

    return cases


@app.get("/cases/{case_id}", tags=["Cases"])
def get_case_detail(case_id: str):
    """
    Returns full case detail including playbook steps and evidence.
    """
    case_data, _ = load_case_by_id(case_id)
    return case_data


@app.get("/playbooks", tags=["Playbooks"])
def get_playbooks():
    """
    Returns the 5 attack response playbooks from data/playbooks.json.
    """
    root = find_project_root()
    pb_file = os.path.join(root, "data", "playbooks.json")
    if os.path.exists(pb_file):
        with open(pb_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


@app.get("/org-profile", tags=["Organization"])
def get_org_profile():
    """
    Returns the organization profile configured for DPDP reports.
    """
    return {
        "name": os.getenv("ORG_NAME", "Kumaraguru College of Technology"),
        "registration_id": "EDU-TN-CBE-2026-0042",
        "address": "Athipalayam Road, Chinnavedampatti, Coimbatore, Tamil Nadu 641049",
        "dpo_name": "Dr. S. Ramachandran",
        "dpo_title": "Data Protection Officer & Head of IT",
        "dpo_email": os.getenv("ORG_DPO_EMAIL", "dpo@kct.ac.in"),
        "dpo_phone": "+91 422 266 9401",
        "it_head_name": "Prethiv Raj",
        "it_head_title": "DevOps & Compliance Lead",
        "cert_in_contact": os.getenv("CERT_IN_CONTACT", "incident@cert-in.org.in")
    }

  
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
