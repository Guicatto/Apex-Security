# Apex Security v1.0

**Plataforma ASPM (Application Security Posture Management)**
Projeto acadêmico — FIAP Cibersegurança 2026

---

## O que é

A Apex Security automatiza o ciclo completo de detecção, priorização e remediação de vulnerabilidades de código. O desenvolvedor sobe código, os scanners rodam no pipeline CI/CD, os alertas são normalizados e priorizados por contexto, e a remediação é gerada por LLM (com secrets protegidos por DLP) e entregue como Pull Request — sempre com revisão humana obrigatória antes do merge.

## Arquitetura — 6 Módulos

| Módulo | Função | Status |
|--------|--------|--------|
| 1 — Pipeline CI/CD | GitHub Actions + Semgrep + Trivy | ✅ Completo |
| 2 — Normalização ASU | JSON canônico unificado | ✅ Completo |
| 3 — Priorização IaC | Regras determinísticas de contexto | ✅ Completo |
| 4 — DLP de Borda | Ofuscação de secrets via Regex | ✅ Completo |
| 5 — Remediação Gemini | Patch + teste unitário automático | ✅ Completo |
| 6 — Pull Request | Branch + commit + PR com revisão humana | ✅ Completo |

E um **Dashboard React** (identidade visual preto e dourado) que consolida alertas, remediações, pull requests e repositórios.

## Stack Tecnológico

- **Backend:** Python 3.11.9 + FastAPI + SQLAlchemy
- **Banco:** PostgreSQL 18.4
- **Frontend:** React + Vite + Recharts
- **CI/CD:** GitHub Actions
- **Scanners:** Semgrep (SAST) + Trivy (IaC/containers)
- **LLM:** Gemini API — gemini-2.5-flash-lite
- **Integração GitHub:** PyGitHub

## Como rodar localmente

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
# Editar .env com suas credenciais
uvicorn main:app --reload
```

API em: http://localhost:8000
Documentação: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard em: http://localhost:5173

> O backend (porta 8000) e o frontend (porta 5173) precisam estar rodando ao mesmo tempo para o dashboard funcionar.

## Variáveis de ambiente (.env)

```
DATABASE_URL=postgresql://postgres:SENHA@localhost:5432/apex_db
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash-lite
GITHUB_TOKEN=ghp_...
GITHUB_REPO=Guicatto/Apex-Security
APEX_API_URL=https://SEU_NGROK.ngrok-free.app
```

O `.env` nunca é commitado (está no `.gitignore`). Use o `backend/.env.example` como template.

## Schema ASU (Apex Standard Unified)

Todo output de scanner é normalizado para um JSON canônico único antes de ser salvo — ver a especificação completa em [docs/asu-schema.md](docs/asu-schema.md).

## Fluxo de funcionamento

1. Dev faz push no repositório
2. GitHub Actions dispara Semgrep e Trivy automaticamente
3. Resultados enviados via POST para `/api/scan`
4. Normalização ASU converte para JSON canônico
5. Priorização por contexto IaC ajusta a severidade
6. No dashboard, clicar em "Remediar" em qualquer alerta
7. DLP ofusca secrets → Gemini gera patch + teste → DLP reverte
8. Clicar em "Criar PR" abre Pull Request no GitHub
9. Equipe revisa e aprova — merge humano obrigatório

## Decisões de arquitetura

- **Custo zero de processamento:** a varredura pesada roda na CPU do pipeline do cliente
- **DLP antes do LLM:** nenhum secret sai da rede antes da ofuscação
- **Human-in-the-loop:** nenhum merge autônomo — revisão humana sempre obrigatória
- **Modelo Gemini:** gemini-2.5-flash-lite (gemini-1.5-flash foi descontinuado; gemini-2.0-flash tem cota zero no free tier desta conta)

## Testes

```bash
cd apex-security          # raiz do projeto
backend\.venv\Scripts\activate
pytest tests/ -v
```

37 testes unitários cobrindo normalização ASU, priorização, DLP e remediação (com mock — não consomem cota do Gemini).
