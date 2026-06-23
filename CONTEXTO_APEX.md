# CONTEXTO_APEX — Estado atual do projeto

Última atualização: 2026-06-22
Reunião atual: R4 concluída / R5 parcial (Módulo 6 aguardando GITHUB_TOKEN)

## Stack tecnológica definida

- Backend: Python 3.11.9 + FastAPI + SQLAlchemy
- Banco: PostgreSQL 18.4 (banco: apex_db) — instalado em D:\postgresql\18
- Frontend: React + Vite (Reunião 6)
- CI/CD: GitHub Actions
- Scanners: Semgrep (SAST) + Trivy (IaC/containers)
- LLM: Gemini API — modelo gemini-2.5-flash-lite (ver nota de migração abaixo)
- Integração GitHub: PyGitHub
- Repositório: https://github.com/Guicatto/Apex-Security

## Status dos módulos

- [x] Módulo 1: Coleta no pipeline CI/CD — COMPLETO
- [x] Módulo 2: Normalização ASU — COMPLETO
- [x] Módulo 3: Priorização por contexto IaC — COMPLETO
- [x] Módulo 4: DLP de Borda — COMPLETO
- [x] Módulo 5: Remediação via Gemini API — COMPLETO (testado com chamada real)
- [x] Módulo 6: Pull Request automático — ESTRUTURA CRIADA, aguardando GITHUB_TOKEN
- [ ] Dashboard React — PENDENTE (R6)

## Arquivos criados nesta sessão (R4/R5)

- backend/services/remediator.py — chamada ao Gemini com DLP integrado (ofusca antes, reverte depois)
- backend/routes/remediate.py — endpoint POST /api/remediate/{alert_id} + GETs de remediação
- backend/services/pr_creator.py — criação de branch, commit e PR via PyGitHub
- backend/routes/pullrequest.py — endpoints de PR (POST, PATCH status, GET list)
- tests/test_remediator.py — testes com mock do Gemini (não consomem cota)
- tests/apex_generated/.gitkeep — pasta onde os testes gerados pela IA são commitados no PR

## Decisões técnicas e correções desta sessão

- **Modelo Gemini migrado**: o prompt fixou `gemini-1.5-flash`, mas ele foi descontinuado
  (a API retorna 404 para generateContent na v1beta). Além disso, esta chave tem cota ZERO
  (free tier limit: 0) para `gemini-2.0-flash`. O modelo flash estável, barato e que TEM cota
  nesta conta é `gemini-2.5-flash-lite` — mantém a decisão "flash, não pro/ultra". Configurável
  via `GEMINI_MODEL` no .env.
- O free tier do flash-lite tem RPM baixo: chamadas em rajada retornam 429 (vira 502 no endpoint).
  Em uso normal (uma remediação por vez) funciona; se aparecer 502, esperar ~20s e repetir.
- Pasta de testes gerados criada em `tests/apex_generated/` na RAIZ (não em backend/tests como
  o mkdir do prompt sugeria) — coerente com a estrutura (tests/ fica na raiz desde a R1) e com
  a entrada `.gitignore tests/apex_generated/*.py`. O pr_creator commita os testes nesse caminho.
- main.py registra 3 routers: scan, remediation, pull-requests.

## Como rodar os testes

```powershell
cd D:\CLAUDE\apex-security
backend\.venv\Scripts\activate
pytest tests/ -v --tb=short
```

Resultado atual: 37 testes, todos verdes (17 normalizer + 5 prioritizer + 11 DLP + 4 remediator).
Os testes do remediator usam mock — não consomem cota do Gemini.

## Fluxo end-to-end validado nesta sessão

POST /api/remediate/2 → DLP ofusca → Gemini (gemini-2.5-flash-lite) gera patch+teste →
ofuscação revertida → salvo na tabela remediations (id=1). GET /api/remediations/2 retorna
patch e teste preenchidos. POST /api/pull-request/2 retorna 503 (sem GITHUB_TOKEN — esperado).

## Variáveis de ambiente (.env)

- DATABASE_URL=postgresql://postgres:***@localhost:5432/apex_db — OK
- GEMINI_API_KEY — OK e testada (chamada real funcionando com gemini-2.5-flash-lite)
- GEMINI_MODEL — opcional; default gemini-2.5-flash-lite se ausente
- GITHUB_TOKEN= — PENDENTE (parada manual desta sessão — ver abaixo)
- APEX_API_URL — configurado como secret no GitHub Actions (ngrok)

## Pendências abertas

- PARADA MANUAL: gerar Personal Access Token do GitHub (escopos repo + workflow) e colocar
  em GITHUB_TOKEN no backend/.env. Sem ele, /api/pull-request/{id} retorna 503 (correto).
- Após o token: testar fluxo completo remediate → pull-request → PR aparece no GitHub.
- Instalar Node.js antes da R6 (dashboard React); Docker Desktop opcional para Trivy local.

## Próxima reunião

R5 continuação — após adicionar GITHUB_TOKEN, testar o fluxo de PR ponta a ponta.
R6 — Dashboard React.
