# CONTEXTO_APEX — Estado final do projeto

Última atualização: 2026-07-22
Status: PROJETO 100% COMPLETO E EM PRODUÇÃO — 11 módulos com interface visual

## Módulo 10 — Autenticação e Multi-tenant (sessão de 2026-07-22)

Cada conta vê apenas os próprios dados. Mudança estrutural: tocou em todas as tabelas e rotas.

- `models.py` — nova tabela `users` (email, hashed_password, company_name, api_key gerada
  automaticamente com `secrets.token_hex(32)`). Coluna `user_id` (nullable=True, indexada)
  em alerts, repositories, remediations, pull_requests, company_profile e risk_assessments.
- `services/auth.py` — hash bcrypt (passlib), JWT HS256 válido por 7 dias, `get_current_user`
  (dependência das rotas) e `get_user_by_api_key` (usado pelo pipeline).
- `routes/auth.py` — `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`.
- **Todas** as rotas de scan/remediate/pullrequest/risk/intent exigem JWT e filtram por
  `user_id == current_user.id`; toda criação grava `user_id`.
- **Exceção documentada — `POST /api/scan`**: é chamado pelo GitHub Actions, que não faz login.
  Identifica a conta pelo header `X-Apex-Api-Key`. Sem a chave, os dados entram com
  `user_id=None` (legado/demo). O workflow envia `${{ secrets.APEX_USER_API_KEY }}`.
- `JWT_SECRET_KEY` no .env e no render.yaml (`generateValue: true` — o Render gera um segredo
  forte automaticamente no deploy).
- Frontend: `pages/Login.jsx`, `pages/Signup.jsx` (exibe a api_key em destaque com instrução
  do secret), `components/ProtectedRoute.jsx`, interceptors do axios (injeta o Bearer e, em
  401, limpa a sessão e volta ao login), botão SAIR e nome da empresa no Layout.
  O `localStorage` é a única exceção documentada ao padrão do projeto — necessário para sessão.

### MIGRAÇÃO DE BANCO — atenção

`Base.metadata.create_all()` cria tabelas novas mas **não altera tabelas existentes**. Por isso
`database.py` tem `run_additive_migrations()`, chamada no import do main.py: executa
`ALTER TABLE IF EXISTS ... ADD COLUMN IF NOT EXISTS` para as colunas novas e cria os índices
de `user_id`. É **idempotente e aditiva** — nunca faz DROP, nenhum dado é apagado. Roda
automaticamente no deploy do Render sobre o banco Neon.

### Dados legados

Os alertas criados antes da autenticação ficam com `user_id=None` e **não foram apagados**.
Eles são dados de demonstração/legado do desenvolvimento inicial e não aparecem para nenhuma
conta logada (as queries filtram por usuário). Para demonstrar o multi-tenant na prática, o
professor pode criar uma conta nova, cadastrar o secret `APEX_USER_API_KEY` num repositório
de teste e ver os alertas dele aparecerem isolados.

## Módulo 11 — Radar (sessão de 2026-07-22)

- `services/radar.py` + `GET /api/radar` + `pages/Radar.jsx` (rota `/radar`, no grupo AVANÇADOS).
- Gera panorama executivo de ameaças por setor, calibrado pelo Perfil da Empresa.
- **AVISO DE HONESTIDADE OBRIGATÓRIO NA UI**: o Gemini não faz busca ao vivo na internet nesta
  configuração. A interface declara que é uma síntese do conhecimento do modelo, não tempo real.
  Não remover esse aviso.

## SLA de Compliance (extensão do Módulo 9)

- Campos `sla_deadline`, `sla_reasoning`, `compliance_risk_level` em `risk_assessments`.
- `services/risk_analyzer.analyze_sla()` + `POST /api/sla-assessment/{alert_id}`.
- Botão **VER SLA** como quarto e último da fileira em Alertas; resultado exibido no card de
  Risco Real com badge colorido por nível (BAIXO verde, MEDIO dourado, ALTO laranja, CRITICO
  vermelho). Prazo é orientação analítica — a LGPD não define prazo técnico fixo de correção.
- Validado com Gemini real: "5 dias uteis", nível ALTO, para SQL Injection HIGH em Tecnologia.

## ⚠ AÇÃO PENDENTE DA EQUIPE — regenerar o GITHUB_TOKEN no Render

O botão "Criar PR" retorna **401 Bad credentials** em produção porque o `GITHUB_TOKEN`
configurado no Render está inválido ou expirado (a variável é `sync: false` no render.yaml,
ou seja, precisa ser preenchida manualmente no painel — não vem do repositório).

O código já foi corrigido para deixar isso explícito: em vez de um 502 com JSON cru, a API
agora responde **HTTP 401** com a mensagem "Token do GitHub invalido ou expirado — verifique
GITHUB_TOKEN nas variaveis de ambiente do Render", e o dashboard mostra
"⚠ Configuração pendente — token do GitHub precisa ser atualizado (ação da equipe)".

**Passo a passo para resolver:**

1. Gerar um novo Personal Access Token:
   - github.com → foto de perfil → **Settings**
   - Rolar até o fim → **Developer settings**
   - **Personal access tokens → Tokens (classic)** → **Generate new token (classic)**
   - Note: `apex-security-pr-creator` · Expiration: 90 days
   - Marcar EXATAMENTE estes escopos: ✅ **repo** (item pai completo) e ✅ **workflow**
   - **Generate token** e copiar (aparece só uma vez)
2. Atualizar no Render:
   - dashboard.render.com → serviço **apex-security-api** → **Environment**
   - Editar a variável **GITHUB_TOKEN** e colar o token novo → **Save changes**
   - O Render reinicia o serviço automaticamente (aguardar ~1 min)
3. Testar: no dashboard em produção, clicar em "Criar PR" em um alerta que já tenha
   remediação. Deve retornar o link do PR, não a mensagem de configuração pendente.
4. (Opcional) Atualizar também o `backend/.env` local com o mesmo token, para o fluxo local.

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

## Módulo 9 — Risco Real (sessão de 2026-07-22)

Traduz a vulnerabilidade em impacto financeiro estimado e desenha o caminho de propagação.

- `backend/models.py` — `CompanyProfile` (tabela `company_profile`) e `RiskAssessment`
  (tabela `risk_assessments`). **A tabela company_profile mantém uma ÚNICA linha** criada
  sob demanda por `_get_or_create_profile()`, com todos os campos preenchidos por defaults
  do modelo — fallback seguro: se o usuário nunca salvar nada, a análise continua funcionando
  e a página nunca quebra por falta de dados.
- `backend/services/risk_analyzer.py` — chama o Gemini com prompt FAIR/LGPD/downtime,
  calibrado pelo perfil da empresa; retorna faixa de impacto, raciocínio e blast radius.
- `backend/routes/risk.py` — `GET/POST /api/company-profile`,
  `POST /api/risk-assessment/{alert_id}`, `GET /api/risk-assessments`,
  `GET /api/risk-assessment/{alert_id}`. Registrado em main.py (agora 5 routers).
- `frontend/src/pages/RealRisk.jsx` — rota `/real-risk`, entre Pull Requests e Repositórios
  na navegação. Formulário de perfil (setor, faturamento, volume de PII, regulamentações,
  contexto operacional) + lista de avaliações com impacto em destaque, multa LGPD, custo de
  downtime, raciocínio FAIR e **blast radius em grafo (reactflow)** — nós coloridos por tipo:
  ponto de entrada (vermelho), movimento lateral (dourado neutro), ativo crítico (dourado
  brilhante com glow).
- Botão **MAPEAR RISCO** adicionado em `Alerts.jsx`, ao lado de REMEDIAR e CRIAR PR.
- A interface declara textualmente que os valores são **estimativas analíticas de apoio à
  decisão**, não números contábeis oficiais — mesma honestidade técnica dos demais módulos.
- Validado com chamada real ao Gemini: perfil "Financeiro / R$ 12M / Alto volume PII" gerou
  impacto R$ 120.000–R$ 600.000, multa LGPD R$ 150.000, downtime R$ 40.000 e blast radius de
  4 nós (dev com senha hardcoded → app web → BD intermediário → BD de clientes).

## Status final

Os 11 módulos (6 originais + 7 Isolation Forest + 8 Intent Checker + 9 Risco Real com SLA +
10 Autenticação multi-tenant + 11 Radar) estão implementados, testados (**41 testes unitários
verdes**) e rodando em produção — todos com interface visual dedicada no dashboard.

**Atenção para a demonstração:** com a autenticação ativa, é preciso criar uma conta para
acessar o painel, e uma conta nova começa vazia (os dados antigos são legado com user_id=None).
Para a demo, criar a conta com antecedência e conectar um repositório com o secret
`APEX_USER_API_KEY` para popular os dados.

Resta a ação de equipe do GITHUB_TOKEN (topo deste arquivo) e as ações humanas da Reunião 8
(ensaio e gravação de demonstração).
