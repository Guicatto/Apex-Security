from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Alert, Repository
from pydantic import BaseModel
from typing import Optional, List
import json
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
    title: str
    file_path: Optional[str]
    line_number: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/scan", status_code=201)
def receive_scan(payload: ScanPayload, db: Session = Depends(get_db)):
    """
    Recebe o output bruto de um scanner (Semgrep ou Trivy)
    e salva no banco. A normalização ASU será adicionada na Reunião 2.
    Por enquanto salva o raw_output para não bloquear o pipeline.
    """
    repo = db.query(Repository).filter(Repository.name == payload.repository).first()
    if not repo:
        repo = Repository(name=payload.repository)
        db.add(repo)
        db.commit()

    try:
        raw_data = json.loads(payload.raw_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="raw_json inválido — não é um JSON válido")

    alert = Alert(
        source_tool=payload.tool,
        repository=payload.repository,
        severity="UNKNOWN",
        title=f"[Raw] Scan recebido de {payload.tool}",
        raw_output=payload.raw_json
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    return {
        "message": "Scan recebido com sucesso",
        "alert_id": alert.id,
        "tool": payload.tool,
        "repository": payload.repository,
        "status": "saved_raw — normalização pendente (Reunião 2)"
    }


@router.get("/alerts", response_model=List[AlertResponse])
def list_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(100).all()


@router.get("/alerts/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return alert


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Alert).count()
    return {
        "total_alerts": total,
        "message": "Stats completos disponíveis após Reunião 2 (normalização ASU)"
    }
