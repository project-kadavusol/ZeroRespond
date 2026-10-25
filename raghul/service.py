import hashlib
import json
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from models import Case, Playbook, CaseStep
from schemas import AlertItem


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def parse_wazuh_time(t: str) -> datetime:
    """
    Module 1 emits ISO 8601 with '+0000' (no colon).
    Python's fromisoformat handles that from 3.11+; for safety we normalize.
    """
    return datetime.fromisoformat(t.replace("+0000", "+00:00"))


def alert_hash(alert: AlertItem) -> str:
    """Deterministic fingerprint of the whole alert payload."""
    payload = json.dumps(alert.model_dump(), sort_keys=True).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


# ---------------------------------------------------------------------------
# Case creation + playbook mapping
# ---------------------------------------------------------------------------
def create_case_from_alert(
    db: Session,
    alert: AlertItem,
    window_minutes: int = 5,
) -> Case | None:
    """
    Returns:
      - the newly created Case, OR
      - an existing Case if the alert falls inside a dedup window, OR
      - None if this exact alert has already been ingested (hash match).
    """
    h = alert_hash(alert)

    # 1. Exact-duplicate guard (idempotent sync across restarts)
    if db.query(Case).filter(Case.alert_hash == h).first():
        return None

    alert_dt = parse_wazuh_time(alert.time)
    window_start = alert_dt - timedelta(minutes=window_minutes)

    # 2. Windowed dedup — same rule/agent/source within N minutes → same incident
    existing = (
        db.query(Case)
        .filter(
            Case.rule_id == alert.rule_id,
            Case.agent == alert.agent,
            Case.source_ip == alert.source_ip,
            Case.status != "resolved",
            Case.alert_time >= window_start,
        )
        .order_by(Case.alert_time.desc())
        .first()
    )
    if existing:
        return existing

    # 3. Create the case
    new_case = Case(
        rule_id=alert.rule_id,
        severity=alert.level,
        description=alert.description,
        mitre_id=alert.mitre_id,
        agent=alert.agent,
        agent_ip=alert.agent_ip,
        source_ip=alert.source_ip,
        target_user=alert.target_user,
        threat_type=alert.threat_type,
        alert_time=alert_dt,
        alert_hash=h,
        status="open",
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    # 4. Map playbook → clone steps into the case
    playbook = (
        db.query(Playbook)
        .filter(Playbook.threat_type == alert.threat_type)
        .first()
    )
    if playbook and playbook.steps:
        for p_step in playbook.steps:
            db.add(CaseStep(
                case_id=new_case.id,
                step_order=p_step.step_order,
                title=p_step.title,
                instruction=p_step.instruction,
                is_completed=0,
            ))
        db.commit()
        db.refresh(new_case)

    return new_case
