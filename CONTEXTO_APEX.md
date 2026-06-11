# CONTEXTO_APEX — Estado atual do projeto

Última atualização: 2026-06-11
Reunião atual: R3 concluída

## Stack tecnológica definida

- Backend: Python 3.11.9 + FastAPI + SQLAlchemy
- Banco: PostgreSQL 18.4 (banco: apex_db) — instalado em D:\postgresql\18
- Frontend: React + Vite (Reunião 6)
- CI/CD: GitHub Actions
- Scanners: Semgrep (SAST) + Trivy (IaC/containers)
- LLM: Gemini API (google-generativeai)
- Integração GitHub: PyGitHub
- Repositório: https://github.com/Guicatto/Apex-Security

## Status dos módulos

- [x] Módulo 1: Coleta no pipeline CI/CD — COMPLETO
- [x] Módulo 2: Normalização ASU — COMPLETO
- [x] Módulo 3: Priorização por contexto IaC — COMPLETO
- [x] Módulo 4: DLP de Borda — COMPLETO
- [ ] Módulo 5: Remediação via Gemini API — PENDENTE (R4)
- [ ] Módulo 6: Pull Request automático — PENDENTE (R5)
- [ ] Dashboard React — PENDENTE (R6)

## Arquivos principais criados

- backend/services/normalizer.py — parsers Semgrep e Trivy para formato ASU
- backend/services/prioritizer.py — motor de regras de priorização
- backend/services/rules.json — regras determinísticas de contexto IaC (5 regras)
- backend/services/dlp.py — detecção e ofuscação de secrets via Regex
- tests/test_normalizer.py — testes unitários da normalização (17 testes)
- tests/test_prioritizer.py — testes unitários da priorização (5 testes)
- tests/test_dlp.py — testes unitários do DLP (11 testes)
- tests/conftest.py — insere backend/ no sys.path (tests/ vive na raiz, conforme estrutura da R1)

## Decisões técnicas tomadas

- LLM: Gemini API (google-generativeai) — não Claude/Anthropic (Business Case a alinhar na R7)
- ORM: SQLAlchemy — não queries SQL brutas
- .env nunca sobe para o GitHub — está no .gitignore
- Python 3.11.9 via winget (o 3.14 não tem wheels para as dependências pinadas)
- Emojis removidos dos prints do database.py — Windows cp1252 não suporta
- Workflow duplicado: pipeline/.github/workflows/ (referência) e raiz .github/workflows/ (o que roda)
- dlp.py: a linha `from typing import tuple` do prompt da R2/R3 foi omitida — é um
  ImportError em Python (no 3.11+ usa-se o tuple nativo em annotations)
- dlp.py: a checagem "já foi substituído" usa `'__APEX_SECRET_' in original_value` (em vez de
  startswith) — evita re-ofuscar um trecho que contém placeholder, o que quebraria a reversão
- Comando de testes: rodar `pytest tests/ -v` a partir da RAIZ do projeto (não de backend/),
  pois tests/ fica na raiz; o conftest.py resolve os imports de services.*

## Como rodar os testes

```powershell
cd D:\CLAUDE\apex-security
backend\.venv\Scripts\activate
pytest tests/ -v --tb=short
```

Resultado atual: 33 testes, todos verdes (17 normalizer + 5 prioritizer + 11 DLP).

## Variáveis de ambiente (.env)

- DATABASE_URL=postgresql://postgres:***@localhost:5432/apex_db — OK
- GEMINI_API_KEY — PRESENTE no .env (ver nota abaixo sobre o formato da chave)
- GITHUB_TOKEN= — PENDENTE (R5)
- APEX_API_URL — configurado como secret no GitHub Actions (ngrok)

## Pendências abertas

- Validar a GEMINI_API_KEY antes da R4 (chave atual não tem o formato AIza... típico
  do Google AI Studio — testar com uma chamada real)
- Instalar Node.js antes da R6 (dashboard React); Docker Desktop opcional para Trivy local

## Próxima reunião

R4 — Remediação via Gemini API (Módulo 5)
