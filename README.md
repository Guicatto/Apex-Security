# Apex Security v1.0

Plataforma ASPM (Application Security Posture Management) desenvolvida como projeto acadêmico — FIAP Cibersegurança 2026.

## O que é

A Apex Security automatiza o ciclo de detecção, priorização e remediação de vulnerabilidades: o desenvolvedor sobe código, os scanners rodam automaticamente no pipeline CI/CD, os alertas são normalizados e priorizados por contexto, e a remediação é gerada por LLM com revisão humana obrigatória antes de qualquer merge.

## Módulos

| # | Módulo                            | Status            |
|---|-----------------------------------|-------------------|
| 1 | Coleta no Pipeline (CI/CD)        | ✅ Completo       |
| 2 | Normalização ASU                  | ✅ Completo       |
| 3 | Priorização por Contexto IaC      | ✅ Completo       |
| 4 | DLP de Borda                      | ✅ Completo       |
| 5 | Remediação via Gemini API         | ⏳ Pendente (R4)  |
| 6 | Pull Request com Revisão Humana   | ⏳ Pendente (R5)  |

## Schema ASU (Apex Standard Unified)

Todo output de scanner é normalizado para um JSON canônico único antes de ser salvo —
ver a especificação completa em [docs/asu-schema.md](docs/asu-schema.md). A priorização
por contexto IaC ([backend/services/rules.json](backend/services/rules.json)) ajusta a
severidade (`severity_adjusted`) com regras determinísticas, e o DLP de Borda
([backend/services/dlp.py](backend/services/dlp.py)) ofusca secrets via Regex antes de
qualquer envio ao LLM.

## Stack

- Python 3.11+ + FastAPI + SQLAlchemy
- PostgreSQL
- Semgrep + Trivy
- GitHub Actions
- Gemini API (Google)
- React + Vite (dashboard — Reunião 6)

## Como rodar localmente

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Editar .env com suas credenciais
uvicorn main:app --reload
```

API disponível em: http://localhost:8000
Documentação automática: http://localhost:8000/docs

## Como rodar os testes

```bash
cd apex-security              # raiz do projeto
backend\.venv\Scripts\activate
pytest tests/ -v --tb=short
```
