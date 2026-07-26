# Apex Security v2.1

**Plataforma ASPM (Application Security Posture Management)**
Projeto acadêmico — FIAP Cibersegurança 2026

Versão atual: **v2.1.0** — ver [CHANGELOG.md](CHANGELOG.md)

---

## 🔴 Acesse a plataforma ao vivo

**Dashboard:** https://apex-security-delta.vercel.app
**API / Documentação interativa:** https://apex-security-api.onrender.com/docs

> Nota: o backend usa free tier da Render, que "dorme" após 15 minutos de inatividade.
> A primeira requisição após um período ocioso pode levar 30-50 segundos para responder
> enquanto o servidor acorda — isso é esperado e não é um bug.

---

## O que é

A Apex Security automatiza o ciclo completo de detecção, priorização e remediação de vulnerabilidades de código. O desenvolvedor sobe código, os scanners rodam no pipeline CI/CD, os alertas são normalizados e priorizados por contexto, e a remediação é gerada por LLM (com secrets protegidos por DLP) e entregue como Pull Request — sempre com revisão humana obrigatória antes do merge.

## Arquitetura — 11 Módulos

| Módulo | Função | Status |
|--------|--------|--------|
| 1 — Pipeline CI/CD | GitHub Actions + Semgrep + Trivy | ✅ Completo |
| 2 — Normalização ASU | JSON canônico unificado | ✅ Completo |
| 3 — Priorização IaC | Regras determinísticas de contexto | ✅ Completo |
| 4 — DLP de Borda | Ofuscação de secrets via Regex | ✅ Completo |
| 5 — Remediação Gemini | Patch + teste unitário automático | ✅ Completo |
| 6 — Pull Request | Branch + commit + PR com revisão humana | ✅ Completo |
| 7 — Análise de Anomalias | Isolation Forest — sinal estatístico consultivo | ✅ Completo |
| 8 — Verificador de Intenção | Consistência commit vs código via LLM | ✅ Completo |
| 9 — Risco Real | Estimativa financeira (FAIR/LGPD) + Blast Radius + SLA de Compliance | ✅ Completo |
| 10 — Autenticação Multi-tenant | Contas isoladas: cada empresa vê apenas os próprios dados | ✅ Completo |
| 11 — Radar | Panorama de ameaças setoriais | ✅ Completo |

E um **Dashboard React** (identidade visual preto e dourado) com 9 páginas: Login/Signup, Dashboard, Alertas, Remediações, Pull Requests, Risco Real, Repositórios e — agrupadas sob "Avançados" — Anomalias, Intenção e Radar.

> **Numeração de módulos:** toda funcionalidade nova é documentada como um Módulo numerado sequencialmente (o próximo seria o Módulo 12), mantendo o padrão dos 6 módulos originais da arquitetura. A numeração aparece apenas nesta documentação — **nunca na interface visível ao usuário final**.

## Como conectar seu próprio repositório

1. Crie uma conta em **Criar conta** no dashboard — a plataforma gera uma **chave de API** exclusiva
2. Copie a chave exibida logo após o cadastro
3. No **seu** repositório GitHub: Settings → Secrets and variables → Actions → New repository secret
   - Nome: `APEX_USER_API_KEY` · Valor: a chave copiada
   - Adicione também `APEX_API_URL` com `https://apex-security-api.onrender.com`
4. Copie o workflow [.github/workflows/apex-scan.yml](.github/workflows/apex-scan.yml) para o seu repositório
5. Faça um push — os alertas aparecem **apenas na sua conta**

## Módulos 7, 8 e 9 — consultivos, não substituem os módulos principais

Complementos que retomam ideias da arquitetura original, agora viáveis porque o banco de produção acumula alertas reais a cada push. **Ambos são aditivos e informativos**: o motor de priorização determinístico ([prioritizer.py](backend/services/prioritizer.py)) continua sendo a fonte oficial e explicável de verdade do sistema, e o Módulo 6 continua sendo a governança que exige revisão humana.

| Módulo | O que faz | Endpoint | Página |
|---|---|---|---|
| 7 — Isolation Forest | Segunda opinião **estatística** — sinaliza alertas que fogem do padrão da base (scikit-learn). Requer ≥ 10 alertas; abaixo disso exibe aviso de volume insuficiente (comportamento esperado, não erro). Não substitui as regras do Módulo 3. | `GET /api/anomaly-analysis` | `/anomaly-analysis` |
| 8 — Intent Checker | Versão **heurística simplificada** do Intent Engine: compara a mensagem do commit com o diff via Gemini e sinaliza divergências. Não integra Jira/Trello e **nunca bloqueia** PRs/merges — apenas informa. | `POST /api/intent-check` | `/intent-checker` |
| 9 — Risco Real | Traduz a vulnerabilidade em **impacto financeiro estimado** (modelo FAIR + multa LGPD + custo de inatividade) e desenha o **blast radius** — o caminho plausível de propagação até um ativo crítico. Inclui o **SLA de Compliance**: prazo sugerido de correção e nível de risco regulatório. Calibrado pelo Perfil da Empresa. Os valores são **estimativas analíticas de apoio à decisão**, não números contábeis oficiais nem prazos legais. | `POST /api/risk-assessment/{id}`, `POST /api/sla-assessment/{id}`, `GET/POST /api/company-profile` | `/real-risk` |
| 11 — Radar | Panorama executivo das ameaças mais relevantes para o setor da empresa. **Não é busca ao vivo na internet** — é uma síntese do conhecimento do modelo de IA, e a interface declara isso explicitamente. | `GET /api/radar` | `/radar` |

## Stack Tecnológico

- **Backend:** Python 3.11.9 + FastAPI + SQLAlchemy
- **Banco:** PostgreSQL 18.4
- **Frontend:** React + Vite + Recharts
- **CI/CD:** GitHub Actions
- **Scanners:** Semgrep (SAST) + Trivy (IaC/containers)
- **LLM:** Gemini API — gemini-2.5-flash-lite
- **ML:** scikit-learn (Isolation Forest)
- **Grafo de propagação:** reactflow
- **Autenticação:** JWT (python-jose) + bcrypt (passlib)
- **Relatórios:** jsPDF + jspdf-autotable
- **Notificações:** webhook do Discord · **E-mail:** Resend (API HTTPS)
- **Internacionalização:** react-i18next — 7 idiomas
- **Integração GitHub:** PyGitHub

## Infraestrutura de produção

| Componente | Serviço | Plano |
|---|---|---|
| Backend (API) | Render.com | Free tier |
| Banco de dados | Neon.tech | Free tier |
| Frontend (Dashboard) | Vercel | Free tier |

## Para desenvolvedores — rodar localmente

> Esta seção é opcional e destinada a quem quer contribuir com o código ou
> rodar testes localmente. A plataforma já está disponível publicamente
> no link acima — não é necessário instalar nada para usá-la.

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
APEX_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

> Em produção, `APEX_API_URL` aponta para a própria URL do Render
> (`https://apex-security-api.onrender.com`) e é configurada como secret no GitHub Actions,
> para que o pipeline envie os resultados dos scanners ao backend hospedado.

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
