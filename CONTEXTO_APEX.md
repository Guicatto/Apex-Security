# CONTEXTO_APEX — Estado final do projeto

Última atualização: 2026-07-22
Status: PROJETO 100% COMPLETO E EM PRODUÇÃO — 8 módulos com interface visual

## Sistema de numeração de módulos (padrão oficial)

Toda funcionalidade nova adicionada ao projeto é documentada como um **Módulo numerado
sequencialmente**, mantendo o padrão dos 6 módulos originais da arquitetura. Aplicado
retroativamente: Módulo 7 = Isolation Forest, Módulo 8 = Intent Checker. A próxima adição
será o Módulo 9. Sempre que um módulo novo entrar, atualizar a tabela de módulos no
README.md e esta seção.

## Interface visual dos Módulos 7 e 8 (sessão de 2026-07-22)

- frontend/src/pages/AnomalyAnalysis.jsx — rota `/anomaly-analysis`. Cabeçalho explicativo
  reforçando que é SINAL CONSULTIVO (Módulo 3 segue oficial), cards de status do modelo
  (treinado / total analisado / anomalias), scatter plot Recharts com anomalias em dourado
  brilhante (#E8C97A com glow) vs normais (#8A7A5A), lista de alertas anômalos com badge ⟡
  e borda dourada, botão "Reexecutar Análise". Caso `trained: false` (< 10 alertas) exibe
  aviso elegante de volume insuficiente — não é tratado como erro.
- frontend/src/pages/IntentChecker.jsx — rota `/intent-checker`. Cabeçalho explicativo
  reforçando que é ALERTA INFORMATIVO (nunca bloqueia PR/merge), formulário de duas colunas
  (input + textarea em JetBrains Mono), botões de exemplo pré-preenchido (commit honesto /
  commit suspeito), badge de resultado CONSISTENTE (verde #1A6B3C) ou DIVERGÊNCIA DETECTADA
  (vermelho #C0392B), percentual de confiança e card com a explicação.
- frontend/src/services/api.js — `getAnomalyAnalysis()` e `checkIntent(msg, diff)`.
- frontend/src/App.jsx — rotas registradas. frontend/src/components/Layout.jsx — itens de nav
  "Anomalias" (✦) e "Intenção" (⟡) agrupados após um separador discreto "AVANÇADOS", para
  distinguir visualmente os módulos consultivos dos operacionais.
- Validado com API real: M7 exibiu 11 alertas analisados / 1 anomalia (Alerta #1, score
  -0.0249); M8 retornou "✗ DIVERGÊNCIA DETECTADA" (100%) no exemplo suspeito e
  "✓ CONSISTENTE" (100%) no honesto. Build de produção OK (647 módulos), console limpo.

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

Os 8 módulos (6 originais + Módulo 7 Isolation Forest + Módulo 8 Intent Checker) estão
implementados, testados (37 testes unitários verdes) e rodando em produção — agora todos
com interface visual dedicada no dashboard. O projeto está pronto para apresentação —
restam apenas as ações humanas da Reunião 8 (ensaio e gravação de demonstração).
