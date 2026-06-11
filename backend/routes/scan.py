from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Alert, Repository
from services.normalizer import normalize
from services.prioritizer import prioritize
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()


class ScanPayload(BaseModel):
    tool: str
    repository: str
    raw_json: str
    branch: Optional[str] = "main"
    commit_sha: Optional[str] = None


class AlertResponse(BaseModel):
    id: int
    source_tool: str
    repository: str
    severity: str
    severity_adjusted: Optional[str]
    title: str
    file_path: Optional[str]
    line_number: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/scan", status_code=201)
def receive_scan(payload: ScanPayload, db: Session = Depends(get_db)):
    # Registrar repositório se não existir
    repo = db.query(Repository).filter(Repository.name == payload.repository).first()
    if not repo:
        repo = Repository(name=payload.repository)
        db.add(repo)
        db.commit()

    # Normalizar para formato ASU
    try:
        normalized_alerts = normalize(payload.tool, payload.raw_json, payload.repository)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Aplicar priorização por contexto IaC
    prioritized_alerts = [prioritize(alert) for alert in normalized_alerts]

    # Salvar cada alerta no banco
    saved_ids = []
    for alert_data in prioritized_alerts:
        alert = Alert(
            source_tool=alert_data["source_tool"],
            repository=alert_data["repository"],
            file_path=alert_data.get("file_path"),
            line_number=alert_data.get("line_number"),
            severity=alert_data["severity"],
            severity_adjusted=alert_data.get("severity_adjusted"),
            title=alert_data["title"],
            description=alert_data.get("description"),
            cve_id=alert_data.get("cve_id"),
            iac_internet_exposed=alert_data.get("iac_internet_exposed"),
            raw_output=alert_data.get("raw_output")
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        saved_ids.append(alert.id)

    return {
        "message": "Scan normalizado e salvo com sucesso",
        "tool": payload.tool,
        "repository": payload.repository,
        "alerts_saved": len(saved_ids),
        "alert_ids": saved_ids
    }


@router.get("/alerts", response_model=List[AlertResponse])
def list_alerts(
    severity: Optional[str] = None,
    repository: Optional[str] = None,
    source_tool: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity_adjusted == severity.upper())
    if repository:
        query = query.filter(Alert.repository == repository)
    if source_tool:
        query = query.filter(Alert.source_tool == source_tool)
    return query.order_by(Alert.created_at.desc()).limit(100).all()


@router.get("/alerts/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return alert


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total = db.query(Alert).count()
    critical = db.query(Alert).filter(Alert.severity_adjusted == "CRITICAL").count()
    high = db.query(Alert).filter(Alert.severity_adjusted == "HIGH").count()
    medium = db.query(Alert).filter(Alert.severity_adjusted == "MEDIUM").count()
    low = db.query(Alert).filter(Alert.severity_adjusted == "LOW").count()
    return {
        "total_alerts": total,
        "by_severity": {
            "CRITICAL": critical,
            "HIGH": high,
            "MEDIUM": medium,
            "LOW": low
        }
    }
