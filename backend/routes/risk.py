from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import CompanyProfile, RiskAssessment, Alert
from services.risk_analyzer import analyze_risk
from pydantic import BaseModel
from typing import Optional
import json

router = APIRouter()


class CompanyProfilePayload(BaseModel):
    sector: Optional[str] = None
    annual_revenue: Optional[str] = None
    sensitive_data_volume: Optional[str] = None
    regulations: Optional[str] = None
    operational_context: Optional[str] = None


def _get_or_create_profile(db: Session) -> CompanyProfile:
    """
    Garante que sempre exista uma linha de perfil. Se nunca foi salvo,
    cria com os valores padrao do modelo — fallback seguro para a analise
    nunca quebrar por falta de dados.
    """
    profile = db.query(CompanyProfile).first()
    if not profile:
        profile = CompanyProfile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/company-profile")
def get_company_profile(db: Session = Depends(get_db)):
    profile = _get_or_create_profile(db)
    return {
        "sector": profile.sector,
        "annual_revenue": profile.annual_revenue,
        "sensitive_data_volume": profile.sensitive_data_volume,
        "regulations": profile.regulations,
        "operational_context": profile.operational_context,
    }


@router.post("/company-profile")
def save_company_profile(payload: CompanyProfilePayload, db: Session = Depends(get_db)):
    profile = _get_or_create_profile(db)
    if payload.sector is not None:
        profile.sector = payload.sector
    if payload.annual_revenue is not None:
        profile.annual_revenue = payload.annual_revenue
    if payload.sensitive_data_volume is not None:
        profile.sensitive_data_volume = payload.sensitive_data_volume
    if payload.regulations is not None:
        profile.regulations = payload.regulations
    if payload.operational_context is not None:
        profile.operational_context = payload.operational_context
    db.commit()
    return {"message": "Perfil da empresa salvo com sucesso"}


@router.post("/risk-assessment/{alert_id}", status_code=201)
def create_risk_assessment(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alerta {alert_id} nao encontrado")

    profile = _get_or_create_profile(db)
    profile_dict = {
        "sector": profile.sector,
        "annual_revenue": profile.annual_revenue,
        "sensitive_data_volume": profile.sensitive_data_volume,
        "regulations": profile.regulations,
        "operational_context": profile.operational_context,
    }

    try:
        result = analyze_risk(
            alert_title=alert.title,
            alert_description=alert.description,
            alert_severity=alert.severity_adjusted or alert.severity,
            company_profile=profile_dict
        )
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=502, detail=f"Erro na analise de risco: {e}")

    assessment = RiskAssessment(
        alert_id=alert_id,
        financial_impact_min=result.get("financial_impact_min"),
        financial_impact_max=result.get("financial_impact_max"),
        fair_reasoning=result.get("fair_reasoning"),
        lgpd_fine_estimate=result.get("lgpd_fine_estimate"),
        downtime_cost_estimate=result.get("downtime_cost_estimate"),
        blast_radius_json=json.dumps(result.get("blast_radius", {}))
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "id": assessment.id,
        "alert_id": alert_id,
        "financial_impact_min": assessment.financial_impact_min,
        "financial_impact_max": assessment.financial_impact_max,
        "fair_reasoning": assessment.fair_reasoning,
        "lgpd_fine_estimate": assessment.lgpd_fine_estimate,
        "downtime_cost_estimate": assessment.downtime_cost_estimate,
        "blast_radius": json.loads(assessment.blast_radius_json),
    }


@router.get("/risk-assessments")
def list_risk_assessments(db: Session = Depends(get_db)):
    assessments = db.query(RiskAssessment).order_by(RiskAssessment.created_at.desc()).limit(50).all()
    return [
        {
            "id": a.id,
            "alert_id": a.alert_id,
            "financial_impact_min": a.financial_impact_min,
            "financial_impact_max": a.financial_impact_max,
            "fair_reasoning": a.fair_reasoning,
            "lgpd_fine_estimate": a.lgpd_fine_estimate,
            "downtime_cost_estimate": a.downtime_cost_estimate,
            "blast_radius": json.loads(a.blast_radius_json) if a.blast_radius_json else {},
            "created_at": a.created_at,
        }
        for a in assessments
    ]


@router.get("/risk-assessment/{alert_id}")
def get_risk_assessment(alert_id: int, db: Session = Depends(get_db)):
    assessment = db.query(RiskAssessment).filter(RiskAssessment.alert_id == alert_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Nenhuma avaliacao de risco para este alerta")
    return {
        "id": assessment.id,
        "alert_id": alert_id,
        "financial_impact_min": assessment.financial_impact_min,
        "financial_impact_max": assessment.financial_impact_max,
        "fair_reasoning": assessment.fair_reasoning,
        "lgpd_fine_estimate": assessment.lgpd_fine_estimate,
        "downtime_cost_estimate": assessment.downtime_cost_estimate,
        "blast_radius": json.loads(assessment.blast_radius_json) if assessment.blast_radius_json else {},
        "created_at": assessment.created_at,
    }
