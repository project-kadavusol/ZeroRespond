"""
Pydantic V2 schemas for ZeroRespond request validation and response serialization.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, computed_field


# ── Step Schemas ─────────────────────────────────────────────────────────────

class PlaybookStepOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    step_order: int
    title: str
    phase: str
    plain: str
    linux_cmd: str
    windows_cmd: str
    expected_outcome: str
    is_blocking: bool = False

    @computed_field
    @property
    def command(self) -> str:
        return self.linux_cmd

    @computed_field
    @property
    def linux(self) -> str:
        return self.linux_cmd

    @computed_field
    @property
    def windows(self) -> str:
        return self.windows_cmd

    @computed_field
    @property
    def exp(self) -> str:
        return self.expected_outcome


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
        return self.linux_cmd

    @computed_field
    @property
    def linux(self) -> str:
        return self.linux_cmd

    @computed_field
    @property
    def windows(self) -> str:
        return self.windows_cmd

    @computed_field
    @property
    def exp(self) -> str:
        return self.expected_outcome


class CaseStepUpdate(BaseModel):
    is_completed: Optional[bool] = None
    notes: Optional[str] = None
    completed_by: Optional[str] = "IT Admin"


# ── Evidence & Timeline Schemas ──────────────────────────────────────────────

class EvidenceItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    size: str
    sha256: str
    category: str
    attestation: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    uploaded_by: Optional[str] = None


class TimelineEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    t: str
    a: str
    type: str = "done"
    user: Optional[str] = None
    created_at: Optional[datetime] = None


# ── Playbook Schemas ─────────────────────────────────────────────────────────

class PlaybookOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    mitre_tag: Optional[str] = None
    iso_phase: Optional[str] = None
    desc: Optional[str] = None
    steps: List[PlaybookStepOut] = []


# ── Case Schemas ─────────────────────────────────────────────────────────────

class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    sev: str
    sev_lbl: str
    title: str
    desc: str
    computer: str
    source_ip: Optional[str] = None
    attacker_ip: Optional[str] = None
    suspect_pid: Optional[str] = None
    target_user: Optional[str] = None
    modified_file: Optional[str] = None
    c2_ip: Optional[str] = None
    assigned_to: str
    status: str
    status_lbl: str
    cur_step: int
    pb: str
    data_categories: str
    persons: int
    opened_time: Optional[str] = None
    opened_full: Optional[str] = None
    detected_at: Optional[datetime] = None
    breach_est_at: Optional[datetime] = None
    contained_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    steps: List[CaseStepOut] = []
    evidence: List[EvidenceItemOut] = []
    timeline: List[TimelineEventOut] = []


class CaseCreate(BaseModel):
    id: Optional[str] = None  # If omitted, auto-generated e.g. IR-2026-XXXX
    title: str
    type: str = "Ransomware"
    sev: str = "critical"
    computer: str
    desc: Optional[str] = ""
    attacker_ip: Optional[str] = None
    source_ip: Optional[str] = None
    target_user: Optional[str] = None
    assigned_to: Optional[str] = "Naveen Kumar"
    persons: Optional[int] = 0
    data_categories: Optional[str] = "Student Records, Staff Information"
    pb: Optional[str] = None


class CaseVariablesUpdate(BaseModel):
    """Payload sent when saving 'Live Playbook Target Variables' in dashboard."""
    attacker_ip: Optional[str] = None
    suspect_pid: Optional[str] = None
    target_user: Optional[str] = None
    modified_file: Optional[str] = None
    c2_ip: Optional[str] = None


class CaseStatusUpdate(BaseModel):
    status: str  # open | investigating | in-progress | contained | resolved | false-positive
    status_lbl: Optional[str] = None


# ── Wazuh Alert & Ingestion Schemas ──────────────────────────────────────────

class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rule_id: str
    level: int
    description: str
    mitre_id: Optional[str] = None
    agent: str
    agent_ip: str
    source_ip: str
    target_user: Optional[str] = None
    threat_type: str
    time: str
    linked_case_id: Optional[str] = None
    created_at: Optional[datetime] = None


class WazuhWebhookPayload(BaseModel):
    """Flexible schema accepting raw Wazuh 4.7 alert JSON directly."""
    timestamp: Optional[str] = None
    rule: Optional[Dict[str, Any]] = None
    agent: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None
    decoder: Optional[Dict[str, Any]] = None
    location: Optional[str] = None
    full_log: Optional[str] = None


class AlertItem(BaseModel):
    """Exact shape returned by Module 1's /api/v1/alerts data[]."""
    agent: str
    agent_ip: str
    description: str
    level: int
    mitre_id: Optional[str] = None
    rule_id: str
    source_ip: str
    target_user: Optional[str] = None
    threat_type: str
    time: str


class Module1AlertResponse(BaseModel):
    status: str
    count: int
    data: List[AlertItem]


class SyncResult(BaseModel):
    status: str
    synced_alerts_count: int
    cases_created_count: int
    case_ids: List[str]


class WazuhConnectionTestRequest(BaseModel):
    url: Optional[str] = None
    user: Optional[str] = None
    password: Optional[str] = None


# ── Organization Profile & Metrics ───────────────────────────────────────────

class OrgProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    org_name: str
    org_type: str
    city: str
    state: str
    registration_id: str
    address: str
    dpo_name: str
    dpo_title: str
    dpo_email: str
    dpo_phone: str
    it_head_name: str
    cert_in_contact: str


class OrgProfileUpdate(BaseModel):
    org_name: Optional[str] = None
    org_type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    registration_id: Optional[str] = None
    address: Optional[str] = None
    dpo_name: Optional[str] = None
    dpo_title: Optional[str] = None
    dpo_email: Optional[str] = None
    dpo_phone: Optional[str] = None
    it_head_name: Optional[str] = None
    cert_in_contact: Optional[str] = None


class MetricsSummaryOut(BaseModel):
    total_cases: int
    active_cases: int
    contained_cases: int
    resolved_cases: int
    mttd_minutes: float
    mttr_minutes: float
    severity_breakdown: Dict[str, int]
    attack_type_breakdown: Dict[str, int]
