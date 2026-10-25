#!/usr/bin/env python3
"""
ZeroRespond - DPDP Act 2023 & CERT-In Compliant Incident Report Service
Owner: Prithiv Raj (Module 4A - Report & DevOps)

Backend service that builds report contexts, renders Jinja2 HTML templates,
and compiles court-admissible PDFs via WeasyPrint for the ZeroDashboard web application.
"""

import os
import sys
import json
from datetime import datetime, timezone, timedelta
from jinja2 import Environment, FileSystemLoader  # type: ignore  # pyrefly: ignore[missing-import]

# Indian Standard Time (IST = UTC + 5:30)
IST = timezone(timedelta(hours=5, minutes=30))


def find_project_root():
    """
    Finds the root directory of the ZeroRespond project across execution contexts.
    """
    if "ZERORESPOND_ROOT" in os.environ and os.path.exists(os.environ["ZERORESPOND_ROOT"]):
        return os.path.abspath(os.environ["ZERORESPOND_ROOT"])

    # If inside Docker container where code is copied to /app
    if os.path.exists("/app/templates") or os.path.exists("/app/data"):
        return "/app"

    # Search upward from the current file
    current = os.path.abspath(os.path.dirname(__file__))
    for _ in range(4):
        if os.path.exists(os.path.join(current, "data")) and os.path.exists(os.path.join(current, "backend")):
            return current
        parent = os.path.dirname(current)
        if parent == current:
            break
        current = parent

    return os.getcwd()


def resolve_reports_dir(output_dir=None):
    """
    Resolves the target reports directory, ensuring it exists.
    """
    root = find_project_root()
    if output_dir:
        if os.path.isabs(output_dir):
            target = output_dir
        else:
            target = os.path.join(root, output_dir)
        os.makedirs(target, exist_ok=True)
        return os.path.abspath(target)

    candidates = [
        os.path.join(root, "data", "reports"),
        os.path.join(root, "reports"),
        "/app/data/reports",
        os.path.abspath("data/reports")
    ]
    for c in candidates:
        if c:
            try:
                os.makedirs(c, exist_ok=True)
                return os.path.abspath(c)
            except OSError:
                continue
    fallback = os.path.abspath("data/reports")
    os.makedirs(fallback, exist_ok=True)
    return fallback


def resolve_template_dir(template_dir=None):
    """
    Resolves the directory containing Jinja2 report templates.
    """
    if template_dir and os.path.exists(template_dir):
        return os.path.abspath(template_dir)

    root = find_project_root()
    candidates = [
        os.path.join(root, "backend", "templates"),
        os.path.join(root, "templates"),
        os.path.join(os.path.dirname(__file__), "..", "templates"),
        "/app/templates",
        "/app/backend/templates"
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.exists(os.path.join(c, "incident_report.html")):
            return os.path.abspath(c)

    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../templates"))


def parse_datetime(dt_val):
    """
    Safely converts a datetime object or ISO string into a timezone-aware UTC datetime.
    """
    if dt_val is None:
        return None
    if isinstance(dt_val, datetime):
        if dt_val.tzinfo is None:
            return dt_val.replace(tzinfo=timezone.utc)
        return dt_val
    if isinstance(dt_val, str):
        # Clean common ISO string variants
        clean_str = dt_val.replace('Z', '+00:00')
        try:
            return datetime.fromisoformat(clean_str)
        except Exception:
            for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M'):
                try:
                    return datetime.strptime(clean_str, fmt).replace(tzinfo=timezone.utc)
                except ValueError:
                    continue
    return None


def format_ist(dt_obj):
    """
    Converts a datetime to a human-readable IST string.
    Example: '2026-04-12 09:45:00 IST'
    """
    if not dt_obj:
        return "Under Investigation / Unknown"
    dt_aware = parse_datetime(dt_obj)
    if not dt_aware:
        return str(dt_obj)
    dt_ist = dt_aware.astimezone(IST)
    return dt_ist.strftime('%Y-%m-%d %H:%M:%S IST')


class CaseAdapter:
    """
    Normalizes input data whether passed as a dictionary, JSON, or SQLAlchemy ORM model.
    """
    def __init__(self, data):
        self._data = data if isinstance(data, dict) else {}
        self._obj = data if not isinstance(data, dict) else None

    def get(self, key, default=None):
        if self._obj is not None:
            return getattr(self._obj, key, default)
        return self._data.get(key, default)

    def __getattr__(self, key):
        if self._obj is not None and hasattr(self._obj, key):
            return getattr(self._obj, key)
        if key in self._data:
            return self._data[key]
        return None


def build_report_context(data):
    """
    Extracts, calculates, and enriches data needed for the incident report template.
    Ensures all 8 statutory DPDP Act 2023 fields and CERT-In metrics are present.
    """
    case_raw = data.get('case', {}) if isinstance(data.get('case'), dict) else {}
    case = CaseAdapter(case_raw)
    
    # Organization details with institutional defaults for Kumaraguru College of Technology
    org_raw = data.get('organization', {}) if isinstance(data.get('organization'), dict) else {}
    org_defaults = {
        'name': os.getenv('ORG_NAME') or org_raw.get('name') or 'Kumaraguru College of Technology',
        'registration_id': org_raw.get('registration_id') or 'EDU-TN-CBE-2026-0042',
        'address': org_raw.get('address') or 'Athipalayam Road, Chinnavedampatti, Coimbatore, Tamil Nadu 641049',
        'dpo_name': org_raw.get('dpo_name') or 'Dr. S. Ramachandran',
        'dpo_title': org_raw.get('dpo_title') or 'Data Protection Officer & Head of IT',
        'dpo_email': os.getenv('ORG_DPO_EMAIL') or org_raw.get('dpo_email') or 'dpo@kct.ac.in',
        'dpo_phone': org_raw.get('dpo_phone') or '+91 422 266 9401',
        'it_head_name': org_raw.get('it_head_name') or 'Prithiv Raj',
        'it_head_title': org_raw.get('it_head_title') or 'DevOps & Compliance Lead',
    }
    org = CaseAdapter({**org_defaults, **org_raw})

    playbook = CaseAdapter(data.get('playbook', {}))
    raw_steps = playbook.get('steps', []) or data.get('completed_steps', [])
    evidence = data.get('evidence', [])
    recommendations = data.get('recommendations', [])

    # Timestamps
    detected_dt = parse_datetime(case.get('detected_at'))
    breach_est_dt = parse_datetime(case.get('breach_est_at'))
    contained_dt = parse_datetime(case.get('contained_at'))
    resolved_dt = parse_datetime(case.get('resolved_at'))
    now_dt = datetime.now(timezone.utc)

    # Calculate Mean Time to Detect (MTTD)
    mttd_display = "N/A"
    if detected_dt and breach_est_dt:
        mttd_minutes = max(0, round((detected_dt - breach_est_dt).total_seconds() / 60, 1))
        mttd_display = f"{mttd_minutes} mins"

    # Calculate Mean Time to Respond (MTTR)
    mttr_display = "Ongoing"
    resp_end = contained_dt or resolved_dt
    if detected_dt and resp_end:
        mttr_minutes = max(0, round((resp_end - detected_dt).total_seconds() / 60, 1))
        mttr_display = f"{mttr_minutes} mins"

    # Calculate CERT-In 6-Hour Statutory SLA Status
    cert_in_sla_status = "COMPLIANT"
    cert_in_sla_elapsed = "Within 6-Hr Limit"
    if detected_dt:
        eval_time = resolved_dt or now_dt
        elapsed_hours = (eval_time - detected_dt).total_seconds() / 3600.0
        elapsed_mins = int((eval_time - detected_dt).total_seconds() / 60.0)

        if elapsed_hours <= 6.0:
            remaining_mins = max(0, 360 - elapsed_mins)
            cert_in_sla_status = "COMPLIANT"
            cert_in_sla_elapsed = f"Elapsed: {elapsed_mins}m ({remaining_mins}m remaining)"
        else:
            cert_in_sla_status = "DEADLINE EXCEEDED"
            cert_in_sla_elapsed = f"Elapsed: {elapsed_mins}m (> 6 Hours)"

    # Format step timestamps to IST
    formatted_steps = []
    for step in raw_steps:
        s_adapter = CaseAdapter(step)
        step_dt = parse_datetime(s_adapter.get('completed_at'))
        formatted_steps.append({
            'step_number': s_adapter.get('step_number', len(formatted_steps) + 1),
            'title': s_adapter.get('title', 'Playbook Step'),
            'phase': s_adapter.get('phase', 'Containment'),
            'command_executed': (
                s_adapter.get('command_executed') or
                s_adapter.get('command') or
                s_adapter.get('linux') or
                s_adapter.get('windows') or
                'N/A'
            ),
            'status': s_adapter.get('status', 'completed'),
            'completed_at_ist': format_ist(step_dt),
            'responder': s_adapter.get('responder', case.get('assigned_responder', 'IT Responder')),
            'notes': s_adapter.get('notes', '')
        })

    # Default recommendations if none provided
    if not recommendations:
        recommendations = [
            "Enforce Multi-Factor Authentication (MFA) across all administrative access endpoints and SSH services.",
            "Verify automated immutable backup copies are isolated and scheduled for daily verification.",
            "Complete post-incident review and file formal CERT-In dispatch acknowledgment with the Data Protection Board."
        ]

    return {
        'case': case,
        'org': org,
        'playbook': playbook,
        'completed_steps': formatted_steps,
        'evidence': evidence,
        'recommendations': recommendations,
        'detected_at_ist': format_ist(detected_dt),
        'breach_est_at_ist': format_ist(breach_est_dt),
        'contained_at_ist': format_ist(contained_dt),
        'resolved_at_ist': format_ist(resolved_dt),
        'generated_at_ist': datetime.now(IST).strftime('%Y-%m-%d %H:%M:%S IST'),
        'mttd_display': mttd_display,
        'mttr_display': mttr_display,
        'cert_in_sla_status': cert_in_sla_status,
        'cert_in_sla_elapsed': cert_in_sla_elapsed,
    }


def render_html_report(data, template_dir=None):
    """
    Renders the Jinja2 template and returns the HTML string and context dict.
    """
    resolved_tpl_dir = resolve_template_dir(template_dir)
    env = Environment(loader=FileSystemLoader(resolved_tpl_dir))
    template = env.get_template('incident_report.html')
    context = build_report_context(data)
    return template.render(**context), context


def generate_report(data, output_dir=None, preview_only=False):
    """
    Main engine for generating compliance reports.
    Produces:
      - An HTML preview file: <case_id>_preview.html
      - An official PDF file:  <case_id>_report.pdf (if WeasyPrint is available)
    Returns structured metadata suitable for both CLI display and FastAPI response.
    """
    case_id = data.get('case', {}).get('id', f"ZR-{datetime.now().strftime('%Y%m%d%H%M')}")
    target_dir = resolve_reports_dir(output_dir)

    html_content, context = render_html_report(data)

    # 1. Always save the HTML preview (zero external dependencies, renders instantly)
    preview_filename = f"{case_id}_preview.html"
    preview_path = os.path.join(target_dir, preview_filename)
    with open(preview_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"[✓] HTML Preview generated: {preview_path}")

    pdf_filename = f"{case_id}_report.pdf"
    pdf_path = os.path.join(target_dir, pdf_filename)
    pdf_generated = False
    message = "HTML preview generated successfully"

    if not preview_only:
        # 2. Compile to PDF using WeasyPrint
        try:
            import importlib
            weasyprint_mod = importlib.import_module("weasyprint")
            weasyprint_mod.HTML(string=html_content).write_pdf(pdf_path)
            pdf_generated = True
            message = "Official PDF & HTML preview generated successfully"
            print(f"[✓] Official PDF generated successfully: {pdf_path}")
        except (ImportError, OSError) as e:
            message = (
                f"HTML preview generated. WeasyPrint/Cairo not available in local Python host ({e}). "
                f"Compile PDF via Docker container or Docker WeasyPrint."
            )
            print(f"[!] WeasyPrint is not installed or missing shared libraries in local host.")
            print(f"[!] HTML preview is available at: {preview_path}")
            print(f"[!] To compile via Docker:")
            print(f"    docker run --rm -v $(pwd):/workspace -w /workspace minidocks/weasyprint weasyprint {preview_path} {pdf_path}")
        except Exception as e:
            message = f"Error during PDF compilation: {e}"
            print(f"[✗] Error during PDF rendering: {e}")

    return {
        "success": True,
        "case_id": case_id,
        "preview_path": preview_path,
        "pdf_path": pdf_path if pdf_generated else None,
        "pdf_generated": pdf_generated,
        "preview_filename": preview_filename,
        "pdf_filename": pdf_filename if pdf_generated else None,
        "mttd": context.get("mttd_display"),
        "mttr": context.get("mttr_display"),
        "cert_in_sla_status": context.get("cert_in_sla_status"),
        "cert_in_sla_elapsed": context.get("cert_in_sla_elapsed"),
        "generated_at_ist": context.get("generated_at_ist"),
        "message": message,
        "context": context
    }


def get_cert_in_email_text(data):
    """
    Constructs the statutory 6-hour CERT-In email disclosure draft according to
    Section 8(6) of India's DPDP Act 2023 and CERT-In 2022 cybersecurity directions.
    """
    ctx = build_report_context(data)
    case = ctx['case']
    org = ctx['org']
    
    categories = case.get('data_categories')
    if isinstance(categories, list):
        cats_str = " / ".join(str(c) for c in categories)
    else:
        cats_str = str(categories or "Operational & Technical Logs")

    persons = case.get('persons_affected', 0)
    persons_str = f"~{persons:,} individuals" if int(persons or 0) > 0 else "0 — No personal data compromised"

    steps = ctx.get('completed_steps', [])
    if steps:
        actions_str = "\n".join([f" • [{s.get('completed_at_ist', 'IST')}] {s.get('title')}: {s.get('command_executed', '')}" for s in steps])
    else:
        actions_str = " • Immediate isolation executed via ZeroRespond playbook; forensic evidence captured."

    body = f"""To: incident@cert-in.org.in
Subject: Cybersecurity Incident Notification — {org.get('name')} — {case.get('id')}

Dear CERT-In Incident Response Team,

We hereby notify you of a cybersecurity incident pursuant to the CERT-In Cybersecurity
Incident Reporting Directions (April 2022) and Section 8(6) of the DPDP Act 2023.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY INCIDENT DISCLOSURE FIELDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 1. Organisation Name      : {org.get('name')}
 2. Registration ID        : {org.get('registration_id', 'EDU-TN-CBE-2026-0042')}
 3. Incident Reference     : {case.get('id')}
 4. Incident Type          : {case.get('breach_type', 'Cyber Incident')}
 5. Affected System        : {case.get('source_host', 'Internal Host')} | IP: {case.get('source_ip', 'Internal IP')}
 6. Data Categories        : {cats_str}
 7. Persons Affected (est) : {persons_str}
 8. Date Discovered (IST)  : {ctx.get('detected_at_ist')}
 9. Estimated Start (IST)  : {ctx.get('breach_est_at_ist')}
10. Current Status         : {str(case.get('status', 'resolved')).upper()}
11. MTTD                   : {ctx.get('mttd_display')}
12. MTTR                   : {ctx.get('mttr_display')}
13. CERT-In SLA            : {ctx.get('cert_in_sla_status')} ({ctx.get('cert_in_sla_elapsed')})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIONS TAKEN (CHRONOLOGICAL AUDIT LOG)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{actions_str}

All containment and eradication steps have been executed via the ZeroRespond Incident
Response Platform. Forensic evidence register and detailed incident dossier are preserved.

DPO Contact  : {org.get('dpo_name')} ({org.get('dpo_email')}, {org.get('dpo_phone')})
Organisation : {org.get('address')}

— End of Statutory Notification —"""
    return body


def load_case_by_id(case_id):
    """
    Searches data/mock_cases/ for a matching case by ID or filename.
    """
    root = find_project_root()
    search_dirs = [
        os.path.join(root, "data", "mock_cases"),
        os.path.join(root, "mock_cases"),
        "/app/data/mock_cases"
    ]

    clean_id = str(case_id).strip().lower()
    
    for s_dir in search_dirs:
        if not os.path.exists(s_dir):
            continue
        
        # 1. Exact filename match: IR-08.json or IR-08_ransomware.json
        for f in os.listdir(s_dir):
            if not f.endswith('.json'):
                continue
            f_path = os.path.join(s_dir, f)
            try:
                with open(f_path, 'r', encoding='utf-8') as jf:
                    data = json.load(jf)
                    cur_id = str(data.get('case', {}).get('id', '')).strip().lower()
                    if cur_id == clean_id or clean_id in f.lower() or f.lower().startswith(clean_id):
                        return data, f_path
            except Exception:
                continue

    # Fallback default template if not found
    return {
        "case": {
            "id": case_id,
            "title": f"Incident {case_id}",
            "severity": "high",
            "status": "contained",
            "breach_type": "Unauthorized Access",
            "source_host": "SRV-PRIMARY-01",
            "source_ip": "192.168.1.100",
            "data_categories": ["Operational Logs", "Internal Credentials"],
            "persons_affected": 150,
            "detected_at": datetime.now(timezone.utc).isoformat(),
            "breach_est_at": (datetime.now(timezone.utc) - timedelta(minutes=45)).isoformat(),
            "contained_at": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat(),
            "resolved_at": datetime.now(timezone.utc).isoformat(),
            "assigned_responder": "Prithiv Raj",
            "desc": f"Automated response completed for incident {case_id}."
        },
        "organization": {
            "name": "Kumaraguru College of Technology",
            "dpo_name": "Dr. S. Ramachandran",
            "dpo_email": "dpo@kct.ac.in"
        },
        "completed_steps": [
            {
                "step_number": 1,
                "title": "Isolate host and block suspicious source IP",
                "phase": "Containment",
                "command_executed": "sudo iptables -I INPUT -j DROP",
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "notes": "Containment rule verified active."
            }
        ]
    }, None


def list_generated_reports(output_dir=None):
    """
    Returns a sorted list of all generated reports in the reports directory.
    """
    target_dir = resolve_reports_dir(output_dir)
    reports = []
    
    if not os.path.exists(target_dir):
        return reports

    files = os.listdir(target_dir)
    # Group by base case id
    seen = {}
    for f in files:
        if f.endswith('.pdf') or f.endswith('.html'):
            f_path = os.path.join(target_dir, f)
            stat = os.stat(f_path)
            
            # Derive case_id
            if '_report.pdf' in f:
                c_id = f.replace('_report.pdf', '')
            elif '_preview.html' in f:
                c_id = f.replace('_preview.html', '')
            else:
                c_id = os.path.splitext(f)[0]
                
            if c_id not in seen:
                seen[c_id] = {
                    'case_id': c_id,
                    'has_pdf': False,
                    'has_preview': False,
                    'pdf_file': None,
                    'preview_file': None,
                    'size_bytes': 0,
                    'created_at': datetime.fromtimestamp(stat.st_mtime, IST).strftime('%Y-%m-%d %H:%M:%S IST'),
                    'mtime': stat.st_mtime
                }
            
            if f.endswith('.pdf'):
                seen[c_id]['has_pdf'] = True
                seen[c_id]['pdf_file'] = f
                seen[c_id]['pdf_size'] = f"{round(stat.st_size / 1024, 1)} KB"
                seen[c_id]['size_bytes'] += stat.st_size
            if f.endswith('.html'):
                seen[c_id]['has_preview'] = True
                seen[c_id]['preview_file'] = f
                seen[c_id]['preview_size'] = f"{round(stat.st_size / 1024, 1)} KB"
                seen[c_id]['size_bytes'] += stat.st_size

    # Sort descending by creation time
    sorted_reports = sorted(seen.values(), key=lambda x: x['mtime'], reverse=True)
    return sorted_reports

