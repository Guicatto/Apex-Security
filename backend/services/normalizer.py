import json
import uuid
from datetime import datetime, timezone
from typing import Optional


def normalize_severity(raw_severity: str) -> str:
    """Normaliza strings de severidade de diferentes ferramentas para padrão ASU."""
    mapping = {
        # Semgrep
        "error": "HIGH",
        "warning": "MEDIUM",
        "info": "INFO",
        "note": "LOW",
        # Trivy
        "critical": "CRITICAL",
        "high": "HIGH",
        "medium": "MEDIUM",
        "low": "LOW",
        "unknown": "INFO",
    }
    return mapping.get(raw_severity.lower(), "INFO")


def parse_semgrep(raw_json: dict, repository: str) -> list[dict]:
    """
    Converte output bruto do Semgrep para lista de alertas no formato ASU.
    O Semgrep retorna: {"results": [...], "errors": [...]}
    """
    alerts = []
    results = raw_json.get("results", [])

    for result in results:
        extra = result.get("extra", {})
        metadata = extra.get("metadata", {})
        start = result.get("start", {})

        raw_severity = extra.get("severity", "warning")
        normalized = normalize_severity(raw_severity)

        alert = {
            "id": str(uuid.uuid4()),
            "source_tool": "semgrep",
            "repository": repository,
            "file_path": result.get("path"),
            "line_number": start.get("line"),
            "severity": normalized,
            "severity_adjusted": normalized,  # será ajustado pelo Módulo 3
            "title": result.get("check_id", "Vulnerabilidade detectada pelo Semgrep"),
            "description": extra.get("message"),
            "cve_id": metadata.get("cve"),
            "iac_internet_exposed": None,  # será preenchido pelo Módulo 3
            "raw_output": json.dumps(result),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        alerts.append(alert)

    return alerts


def parse_trivy(raw_json: dict, repository: str) -> list[dict]:
    """
    Converte output bruto do Trivy para lista de alertas no formato ASU.
    O Trivy retorna: {"Results": [{"Vulnerabilities": [...], "Misconfigurations": [...]}]}
    """
    alerts = []
    results = raw_json.get("Results", [])

    for result in results:
        target = result.get("Target", "unknown")

        # Vulnerabilidades de pacotes
        for vuln in result.get("Vulnerabilities", []) or []:
            raw_severity = vuln.get("Severity", "UNKNOWN")
            normalized = normalize_severity(raw_severity)

            alert = {
                "id": str(uuid.uuid4()),
                "source_tool": "trivy",
                "repository": repository,
                "file_path": target,
                "line_number": None,
                "severity": normalized,
                "severity_adjusted": normalized,
                "title": vuln.get("VulnerabilityID", "Vulnerabilidade desconhecida"),
                "description": vuln.get("Description") or vuln.get("Title"),
                "cve_id": vuln.get("VulnerabilityID") if (vuln.get("VulnerabilityID") or "").startswith("CVE") else None,
                "iac_internet_exposed": None,
                "raw_output": json.dumps(vuln),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            alerts.append(alert)

        # Misconfigurations de IaC
        for misc in result.get("Misconfigurations", []) or []:
            raw_severity = misc.get("Severity", "UNKNOWN")
            normalized = normalize_severity(raw_severity)

            alert = {
                "id": str(uuid.uuid4()),
                "source_tool": "trivy",
                "repository": repository,
                "file_path": target,
                "line_number": misc.get("CauseMetadata", {}).get("StartLine"),
                "severity": normalized,
                "severity_adjusted": normalized,
                "title": misc.get("Title", "Misconfiguration de IaC"),
                "description": misc.get("Description"),
                "cve_id": None,
                "iac_internet_exposed": None,
                "raw_output": json.dumps(misc),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            alerts.append(alert)

    return alerts


def normalize(tool: str, raw_json_str: str, repository: str) -> list[dict]:
    """
    Ponto de entrada principal da normalização ASU.
    Recebe o tool name e o JSON bruto como string.
    Retorna lista de alertas normalizados.
    """
    try:
        raw_data = json.loads(raw_json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON inválido recebido de {tool}: {e}")

    if tool == "semgrep":
        return parse_semgrep(raw_data, repository)
    elif tool == "trivy":
        return parse_trivy(raw_data, repository)
    else:
        # Ferramenta desconhecida — salva como alerta genérico sem quebrar
        return [{
            "id": str(uuid.uuid4()),
            "source_tool": tool,
            "repository": repository,
            "file_path": None,
            "line_number": None,
            "severity": "INFO",
            "severity_adjusted": "INFO",
            "title": f"Scan recebido de ferramenta desconhecida: {tool}",
            "description": "Normalização ASU não disponível para esta ferramenta",
            "cve_id": None,
            "iac_internet_exposed": None,
            "raw_output": raw_json_str,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }]
