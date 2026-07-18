# CONTEXTO_APEX — Estado final do projeto

Última atualização: 2026-07-18
Status: PROJETO 100% COMPLETO E EM PRODUÇÃO

## Infraestrutura de produção

- Backend: https://apex-security-api.onrender.com
- Frontend: https://apex-security-delta.vercel.app
- Banco: Neon.tech (PostgreSQL serverless, DATABASE_URL com SSL obrigatório)

## Correções desta sessão

- [x] Sincronização com GitHub confirmada — os commits do deploy (25e480e) e da validação
      de telemetria (0b7e047) já estão em origin/main; nada pendente de push no início da sessão
- [x] Rota raiz "/" adicionada em main.py com resposta amigável (service/version/status/docs/health)
      — evita o "Not Found" cru na URL base do backend durante a apresentação
- [x] (opcional) Isolation Forest implementado como sinal consultivo
- [x] (opcional) Intent Checker leve implementado

## Módulos avançados (opcionais, aditivos e consultivos)

- backend/services/anomaly_detector.py + GET /api/anomaly-analysis — Isolation Forest
  (scikit-learn) sobre os alertas do banco. Requer ≥ 10 alertas. É uma SEGUNDA OPINIÃO
  estatística; NÃO substitui o prioritizer.py (regras determinísticas continuam sendo o
  motor oficial e explicável). Validado local: 11 alertas, 1 anomalia detectada.
- backend/services/intent_checker.py + backend/routes/intent.py + POST /api/intent-check —
  versão heurística SIMPLIFICADA do Intent Engine (compara mensagem de commit vs diff via
  Gemini). NÃO integra Jira/Trello e NUNCA bloqueia PRs/merges — apenas sinaliza. Validado
  local: aprova commit honesto (consistent=true) e sinaliza divergente (typo que na verdade
  adiciona chave AWS + reverse shell → consistent=false).
- scikit-learn==1.5.0 adicionado ao requirements.txt.
- main.py agora registra 4 routers: scan, remediation, pull-requests, intent.

## Nota sobre modelos LLM

- Módulo 5 usa Gemini API (gemini-2.5-flash-lite) — funcionando e gratuito.
- Claude Fable 5 (Anthropic) disponível publicamente desde 01/07/2026, mais capaz em tarefas
  complexas. É uma ALTERNATIVA OPCIONAL, não uma correção necessária. Para adotá-lo no
  remediator.py bastaria trocar a lib google-generativeai pelo SDK anthropic e a variável
  GEMINI_API_KEY por ANTHROPIC_API_KEY — decisão do grupo, não feita automaticamente.

## Stack (inalterada)

- Backend: Python 3.11.9 + FastAPI + SQLAlchemy · Banco: PostgreSQL (Neon)
- Frontend: React + Vite + Recharts (Vercel) · LLM: Gemini (gemini-2.5-flash-lite via GEMINI_MODEL)
- CI/CD: GitHub Actions (Semgrep + Trivy), workflow reporta HTTP status explicitamente
  (NÃO reintroduzir `|| echo` que mascara erros)
- Integração GitHub: PyGitHub · Repositório: https://github.com/Guicatto/Apex-Security

## Status final

Todos os 6 módulos da arquitetura original + 2 módulos avançados opcionais estão
implementados, testados (37 testes unitários verdes) e rodando em produção. O projeto
está pronto para apresentação — restam apenas as ações humanas da Reunião 8 (ensaio e
gravação de demonstração).
