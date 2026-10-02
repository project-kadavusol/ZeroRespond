from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class AlertItem(BaseModel):
    """Exact shape returned by Module 1's /api/v1/alerts data[]."""
    agent: str
    agent_ip: str
    description: str
    level: int
    mitre_id: str
    rule_id: str
    source_ip: str
    target_user: str
    threat_type: str
    time: str


class Module1AlertResponse(BaseModel):
    status: str
    count: int
    data: List[AlertItem]


class CaseStepOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    step_order: int
    title: str
    instruction: str
    is_completed: int
    notes: Optional[str] = None


class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rule_id: str
    severity: int
    description: str
    mitre_id: str
    agent: str
    agent_ip: str
    source_ip: str
    target_user: str
    threat_type: str
    alert_time: datetime
    status: str
    created_at: datetime
    steps: List[CaseStepOut] = []


class CaseStepUpdate(BaseModel):
    is_completed: Optional[int] = None
    notes: Optional[str] = None


class SyncResult(BaseModel):
    status: str
    synced_alerts_count: int
    cases_created_count: int
    case_ids: List[int]
