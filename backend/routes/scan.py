from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import Alert, Repository, User
from services.normalizer import normalize
from services.prioritizer import prioritize
from services.anomaly_detector import train_and_score
from services.auth import get_current_user, get_user_by_api_key
from services.discord_notifier import send_discord_alert
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
def receive_scan(
    payload: ScanPayload,
    db: Session = Depends(get_db),
    x_apex_api_key: str = Header(None)
):
    """
    EXCECAO AO JWT: este endpoint e chamado pelo GitHub Actions, que nao consegue
    fazer login. A conta e identificada pela api_key no header X-Apex-Api-Key.
    Sem a chave, os dados entram como legado/demo (user_id=None).
    """
    user = get_user_by_api_key(x_apex_api_key, db) if x_apex_api_key else None
    user_id = user.id if user else None

    # Registrar repositorio se ainda nao existir (inventario global; o nome e unico)
    repo = db.query(Repository).filter(Repository.name == payload.repository).first()
    if not repo:
        repo = Repository(name=payload.repository, user_id=user_id)
        db.add(repo)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()

    # Normalizar para formato ASU
    try:
        normalized_alerts = normalize(payload.tool, payload.raw_json, payload.repository)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Aplicar priorização por contexto IaC
    prioritized_alerts = [prioritize(alert) for alert in normalized_alerts]

    # Salvar cada alerta no banco, associado a conta dona da api_key
    saved_ids = []
    for alert_data in prioritized_alerts:
        alert = Alert(
            user_id=user_id,
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

        # Notificacao best-effort: falha no Discord nunca quebra o salvamento
        if user and user.discord_webhook_url:
            try:
                send_discord_alert(
                    user.discord_webhook_url,
                    alert.title,
                    alert.severity_adjusted or alert.severity,
                    alert.repository
                )
            except Exception:
                pass

    return {
        "message": "Scan normalizado e salvo com sucesso",
        "tool": payload.tool,
        "repository": payload.repository,
        "alerts_saved": len(saved_ids),
        "alert_ids": saved_ids,
        "account": user.company_name if user else "legado/demo (sem api_key)"
    }


@router.get("/alerts", response_model=List[AlertResponse])
def list_alerts(
    severity: Optional[str] = None,
    repository: Optional[str] = None,
    source_tool: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    if severity:
        query = query.filter(Alert.severity_adjusted == severity.upper())
    if repository:
        query = query.filter(Alert.repository == repository)
    if source_tool:
        query = query.filter(Alert.source_tool == source_tool)
    return query.order_by(Alert.created_at.desc()).limit(100).all()


@router.get("/alerts/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return alert


@router.get("/anomaly-analysis")
def get_anomaly_analysis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Executa o modelo Isolation Forest sobre os alertas da conta logada
    e retorna quais sao estatisticamente anomalos.
    Este e um sinal CONSULTIVO — nao substitui as regras deterministicas
    do motor de priorizacao, apenas adiciona uma camada de analise estatistica.
    """
    result = train_and_score(db, user_id=current_user.id)
    return result


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    base = db.query(Alert).filter(Alert.user_id == current_user.id)
    total = base.count()
    critical = base.filter(Alert.severity_adjusted == "CRITICAL").count()
    high = base.filter(Alert.severity_adjusted == "HIGH").count()
    medium = base.filter(Alert.severity_adjusted == "MEDIUM").count()
    low = base.filter(Alert.severity_adjusted == "LOW").count()
    return {
        "total_alerts": total,
        "by_severity": {
            "CRITICAL": critical,
            "HIGH": high,
            "MEDIUM": medium,
            "LOW": low
        }
    }
