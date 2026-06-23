# CONTEXTO_APEX — Estado final do projeto

Última atualização: 2026-06-23
Status: PROJETO 100% COMPLETO

## Todos os módulos entregues

- [x] Módulo 1: Coleta no pipeline CI/CD
- [x] Módulo 2: Normalização ASU
- [x] Módulo 3: Priorização por contexto IaC
- [x] Módulo 4: DLP de Borda
- [x] Módulo 5: Remediação via Gemini API
- [x] Módulo 6: Pull Request automático com revisão humana
- [x] Dashboard React — identidade visual preto e dourado

## Stack tecnológica

- Backend: Python 3.11.9 + FastAPI + SQLAlchemy
- Banco: PostgreSQL 18.4 (banco: apex_db) — em D:\postgresql\18
- Frontend: React + Vite + Recharts (pasta frontend/)
- CI/CD: GitHub Actions
- Scanners: Semgrep (SAST) + Trivy (IaC/containers)
- LLM: Gemini API — modelo gemini-2.5-flash-lite (configurável via GEMINI_MODEL)
- Integração GitHub: PyGitHub
- Repositório: https://github.com/Guicatto/Apex-Security

## Estrutura final do frontend

- frontend/index.html — fontes Google (Cinzel, Raleway, Inter, JetBrains Mono), favicon = logo
- frontend/public/apex-logo.png — logo oficial usado no header (40px)
- frontend/src/theme.js — paleta, gradientes, fontes, severityConfig
- frontend/src/index.css — CSS global (variáveis preto/dourado, scrollbar, divider)
- frontend/src/services/api.js — cliente axios para o backend (porta 8000)
- frontend/src/components/ — Layout, Card, SeverityBadge, StatCard
- frontend/src/pages/ — Dashboard, Alerts, PullRequests, Remediations, Repositories
- frontend/src/App.jsx + main.jsx — rotas (react-router-dom)

## Como rodar (backend + frontend juntos)

```powershell
# Terminal 1 — backend
cd D:\CLAUDE\apex-security\backend
.venv\Scripts\activate
uvicorn main:app --reload          # http://localhost:8000

# Terminal 2 — frontend
cd D:\CLAUDE\apex-security\frontend
npm run dev                        # http://localhost:5173
```

## Notas de ambiente desta máquina

- Node.js v24.17.0 está instalado em D:\Node.js (não na PATH padrão de alguns shells —
  se `node`/`npm` não forem reconhecidos, usar o caminho completo ou adicionar D:\Node.js à PATH)
- Python 3.11.9 no venv backend/.venv (3.14 não tem wheels para as deps pinadas)
- GITHUB_TOKEN configurado no .env — fluxo de PR validado de ponta a ponta
- Modelo Gemini: gemini-2.5-flash-lite (1.5-flash descontinuado; 2.0-flash com cota zero)
- Free tier do Gemini tem RPM baixo: chamadas em rajada dão 429 (502 no endpoint) — repetir após ~20s

## Fluxo validado nesta sessão

PR real criado: https://github.com/Guicatto/Apex-Security/pull/2 (alert 2 → remediação id 1 →
branch apex/fix-2-... → PR com patch + teste). Dashboard sobe em localhost:5173 com design
preto/dourado, consumindo dados reais do backend (4 alertas, gráfico por severidade, botões
REMEDIAR e CRIAR PR funcionais). 37 testes unitários verdes. Build de produção do frontend OK.

## Pendências humanas (fora do escopo do Claude Code)

- [ ] Gravação do vídeo de demonstração do fluxo completo
- [ ] Aprovação do PR de demonstração na apresentação
- [ ] Apresentação final para o professor (Reunião 8)
