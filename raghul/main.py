import requests
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import engine, get_db, SessionLocal
import models
from schemas import AlertItem, Module1AlertResponse, CaseOut, CaseStepUpdate, SyncResult
from service import create_case_from_alert
from seed import seed_playbooks

# --- Bootstrap ---------------------------------------------------------------
models.Base.metadata.create_all(bind=engine)

with SessionLocal() as _db:
    seed_playbooks(_db)

MODULE_1_URL = "http://localhost:5000/api/v1/alerts"

app = FastAPI(title="ZeroRespond Backend — M2 Case Engine")


# --- Routes ------------------------------------------------------------------
@app.post("/api/v1/sync-alerts", response_model=SyncResult)
def sync_alerts_from_module1(db: Session = Depends(get_db)):
    """
    Pull alerts from Module 1 and persist high/critical ones (level >= 12)
    as Cases with their playbook steps cloned in.
    """
    try:
        r = requests.get(MODULE_1_URL, timeout=5)
        r.raise_for_status()
        payload = Module1AlertResponse.model_validate(r.json())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to pull alerts from Module 1: {e}")

    created_ids: list[int] = []
    for alert_data in payload.data:
        if alert_data.level < 12:
            continue
        case = create_case_from_alert(db, alert_data)
        if case is not None:
            created_ids.append(case.id)

    return SyncResult(
        status="success",
        synced_alerts_count=payload.count,
        cases_created_count=len(created_ids),
        case_ids=created_ids,
    )


@app.get("/api/v1/cases", response_model=list[CaseOut])
def list_cases(db: Session = Depends(get_db)):
    return (
        db.query(models.Case)
        .options(joinedload(models.Case.steps))
        .order_by(models.Case.created_at.desc())
        .all()
    )


@app.get("/api/v1/cases/{case_id}", response_model=CaseOut)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = (
        db.query(models.Case)
        .options(joinedload(models.Case.steps))
        .filter(models.Case.id == case_id)
        .first()
    )
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.patch("/api/v1/cases/{case_id}/steps/{step_id}", response_model=CaseOut)
def update_case_step(
    case_id: int,
    step_id: int,
    payload: CaseStepUpdate,
    db: Session = Depends(get_db),
):
    step = (
        db.query(models.CaseStep)
        .filter(models.CaseStep.id == step_id, models.CaseStep.case_id == case_id)
        .first()
    )
    if not step:
        raise HTTPException(status_code=404, detail="Case step not found")

    if payload.is_completed is not None:
        step.is_completed = payload.is_completed
    if payload.notes is not None:
        step.notes = payload.notes
    db.commit()

    case = (
        db.query(models.Case)
        .options(joinedload(models.Case.steps))
        .filter(models.Case.id == case_id)
        .first()
    )
    return case


@app.patch("/api/v1/cases/{case_id}/status")
def update_case_status(case_id: int, status: str, db: Session = Depends(get_db)):
    if status not in ("open", "in_progress", "resolved"):
        raise HTTPException(status_code=400, detail="Invalid status")
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.status = status
    db.commit()
    return {"status": "ok", "case_id": case_id, "new_status": status}


@app.get("/health")
def health():
    return {"status": "ok"}
