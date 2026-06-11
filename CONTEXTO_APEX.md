# CONTEXTO_APEX — Estado atual do projeto

Última atualização: 2026-06-11
Reunião atual: R1 concluída (pendências manuais listadas abaixo)

## Stack tecnológica definida

- Backend: Python 3.11 + FastAPI + SQLAlchemy
- Banco: PostgreSQL 18 (banco: apex_db) — instalado em D:\postgresql\18
- Frontend: React + Vite (Reunião 6)
- CI/CD: GitHub Actions
- Scanners: Semgrep (SAST) + Trivy (IaC/containers)
- LLM: Gemini API (google-generativeai) — decisão confirmada pelo grupo em 2026-06-11
  (o Business Case oficial menciona Claude/Anthropic; o grupo optou por seguir o prompt
  operacional com Gemini — revisar o Business Case na R7 para alinhar os documentos)
- Integração GitHub: PyGitHub

## Status dos módulos

- [x] Módulo 1: Coleta no pipeline CI/CD (workflow criado; falta push + secret — ver pendências)
- [ ] Módulo 2: Normalização ASU
- [ ] Módulo 3: Priorização por contexto IaC
- [ ] Módulo 4: DLP de Borda
- [ ] Módulo 5: Remediação via Gemini API
- [ ] Módulo 6: Pull Request automático
- [ ] Dashboard React

## Decisões técnicas tomadas

- Usamos SQLAlchemy como ORM (não queries SQL brutas)
- .env nunca sobe para o GitHub (está no .gitignore)
- APEX_API_URL é configurado como secret no GitHub Actions
- O endpoint /api/scan por enquanto salva raw_output — normalização na R2
- O workflow apex-scan.yml existe em DOIS lugares: pipeline/.github/workflows/ (cópia de
  referência, conforme estrutura do prompt) e .github/workflows/ na RAIZ — o GitHub Actions
  só executa workflows da raiz do repositório; sem a cópia na raiz o pipeline nunca dispararia
- No workflow, a instalação do Trivy usa keyring (gpg --dearmor) em vez de apt-key, e o scan
  usa --scanners vuln,misconfig em vez de --security-checks vuln,config: o apt-key foi removido
  do Ubuntu 24.04 (runner ubuntu-latest) e a flag --security-checks foi removida do Trivy atual
- Prints de database.py usam [OK]/[ERRO] em vez de emoji ✅/❌: o console Windows (cp1252)
  lança UnicodeEncodeError com emoji e derrubava o startup do uvicorn

## Ambiente desta máquina (notas da R1)

- Python 3.14.6 era o único instalado; Python 3.11.9 foi instalado via winget (escopo usuário)
  para casar com os pins exatos do requirements.txt (psycopg2-binary 2.9.9 e pydantic 2.7.1
  não têm wheels para 3.14). O venv usa Python 3.11.9.
- Node.js NÃO está instalado nesta máquina — necessário só na R6 (dashboard React). Instalar antes.
- Docker Desktop NÃO está instalado — só necessário para rodar Trivy localmente; no CI o Trivy
  roda no runner do GitHub. Instalar se quiser testar Trivy local.

## Variáveis de ambiente necessárias (.env)

- DATABASE_URL=postgresql://postgres:SENHA@localhost:5432/apex_db (já configurado)
- GEMINI_API_KEY=AIza... (PENDENTE — adicionar a chave real, nunca commitar)
- GITHUB_TOKEN=(será adicionado na R5)
- APEX_API_URL=(URL pública da API via ngrok — necessário para o GitHub Actions enviar resultados)

## Pendências abertas

- Criar o repositório apex-security no GitHub e fazer o push (parada manual 1)
- Configurar secret APEX_API_URL no GitHub (parada manual 2 — requer ngrok rodando)
- Preencher GEMINI_API_KEY no backend/.env (parada manual 3)
- Testar o pipeline completo com push de vulnerabilidade proposital (parada manual 4)
- Instalar Node.js antes da R6; Docker Desktop opcional para Trivy local

## Próxima reunião

R2 — Normalização ASU (parsers Semgrep e Trivy → JSON canônico)
