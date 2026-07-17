# CONTEXTO_APEX — Estado atual do projeto

Última atualização: 2026-07-17
Status: Código 100% pronto para produção — aguardando deploy manual (ver DEPLOY.md)

## Diagnóstico do bug de sincronização

**Sintoma:** dashboard não atualizava com alertas novos, mesmo com o GitHub Actions "verde".

**Causa raiz identificada:** o secret `APEX_API_URL` no GitHub aponta para uma URL efêmera
do ngrok que expirou (o free tier do ngrok gera URL nova a cada reinício). O workflow enviava
os scans para um endereço morto e o step usava `curl -s ... || echo "API indisponível"`,
que **engole qualquer falha**: `curl -s` sem `--fail` retorna exit 0 até para HTTP 4xx/5xx,
e o `|| echo` mascarava o erro de conexão — por isso o job ficava verde sem dado nenhum
chegar ao banco. Evidência: os alertas reais do repositório `Guicatto/Apex-Security` que
EXISTEM no banco chegaram enquanto o ngrok estava vivo; pararam quando a URL expirou.

**Verificações complementares:** frontend não tem nenhum cache (axios puro, busca a cada
mount) — descartado; CORS não afeta o envio do Actions (curl não obedece CORS), mas o
`main.py` só permitia localhost e bloquearia o dashboard em produção — corrigido com
`FRONTEND_URL` (ver abaixo).

**Correção aplicada:** os dois steps de envio do workflow agora capturam o código HTTP
(`curl -w "%{http_code}"`) e **falham visivelmente** (`exit 1`) com o corpo da resposta
quando o envio não retorna 2xx. A solução definitiva da raiz (URL efêmera) é a hospedagem
permanente no Render — preparada nesta sessão.

## Preparação para deploy — concluída

- [x] Backend com todas as configs externalizadas via .env (nenhuma URL/credencial hardcoded)
- [x] render.yaml criado na raiz (runtime python, startCommand com $PORT dinâmico)
- [x] CORS preparado para aceitar domínio de produção via FRONTEND_URL (fallback localhost)
- [x] Frontend com VITE_API_URL configurável (frontend/src/services/api.js)
- [x] frontend/.env.example (produção) e frontend/.env.local (dev, ignorado pelo git via *.local)
- [x] vercel.json criado com rewrites para react-router (evita 404 em rotas diretas)
- [x] Build de produção testado localmente sem erros (npm run build → dist/ OK)
- [x] Workflow GitHub Actions corrigido para reportar falhas claramente (nas 2 cópias:
      .github/workflows/ e pipeline/.github/workflows/)
- [x] GET /health não depende de nada além do banco — adequado para health check do Render
- [x] DEPLOY.md criado com passo a passo completo

## Stack (inalterada)

- Backend: Python 3.11.9 + FastAPI + SQLAlchemy · Banco: PostgreSQL
- Frontend: React + Vite + Recharts · LLM: Gemini (gemini-2.5-flash-lite via GEMINI_MODEL)
- CI/CD: GitHub Actions (Semgrep + Trivy) · Integração GitHub: PyGitHub
- Repositório: https://github.com/Guicatto/Apex-Security

## Pendências manuais (fora do escopo do Claude Code)

- [ ] Criar conta no Neon.tech e obter DATABASE_URL de produção
- [ ] Criar conta no Render.com e fazer deploy do backend
- [ ] Criar conta no Vercel e fazer deploy do frontend (Root Directory: frontend)
- [ ] Atualizar secret APEX_API_URL no GitHub com a URL permanente do Render
- [ ] Testar fluxo completo em produção (commit de teste → Actions ✅ → dashboard atualiza)

## Próximo passo

Seguir o arquivo DEPLOY.md na raiz do projeto, na ordem: Neon → Render → Vercel → GitHub secret → teste final.
