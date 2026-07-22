from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean
from sqlalchemy.sql import func
from database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    source_tool = Column(String(50), nullable=False)
    repository = Column(String(255), nullable=False)
    file_path = Column(Text)
    line_number = Column(Integer)
    severity = Column(String(20), nullable=False)
    severity_adjusted = Column(String(20))
    title = Column(String(500), nullable=False)
    description = Column(Text)
    cve_id = Column(String(50))
    iac_internet_exposed = Column(Boolean, default=None)
    raw_output = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    github_url = Column(String(500))
    registered_at = Column(DateTime(timezone=True), server_default=func.now())


class Remediation(Base):
    __tablename__ = "remediations"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, nullable=False)
    patch_code = Column(Text)
    test_code = Column(Text)
    pr_description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CompanyProfile(Base):
    """
    Perfil da empresa usado para calibrar a estimativa de risco financeiro.
    Mantem uma UNICA linha; todos os campos tem default seguro, entao a
    analise nunca quebra por falta de preenchimento do usuario.
    """
    __tablename__ = "company_profile"

    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String(100), default="Tecnologia / Software")
    annual_revenue = Column(String(50), default="R$ 5.000.000,00")
    sensitive_data_volume = Column(String(100), default="Médio — até 50 mil registros")
    regulations = Column(Text, default="LGPD")
    operational_context = Column(Text, default="")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, nullable=False)
    financial_impact_min = Column(String(50))
    financial_impact_max = Column(String(50))
    financial_impact_currency = Column(String(10), default="BRL")
    fair_reasoning = Column(Text)
    lgpd_fine_estimate = Column(String(50))
    downtime_cost_estimate = Column(String(50))
    blast_radius_json = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, nullable=False)
    remediation_id = Column(Integer)
    github_pr_url = Column(String(500))
    github_pr_number = Column(Integer)
    branch_name = Column(String(255))
    status = Column(String(20), default="open")
    approved_by = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
