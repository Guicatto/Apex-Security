# Guia de Deploy — Apex Security v1.0

Este documento cobre o processo de colocar a Apex Security em produção,
acessível publicamente sem depender de nenhum computador específico.

## Arquitetura de produção

| Componente | Serviço | URL após deploy |
|---|---|---|
| Backend (API) | Render.com | https://apex-security-api.onrender.com |
| Banco de dados | Neon.tech | interno, via DATABASE_URL |
| Frontend (Dashboard) | Vercel | https://apex-security.vercel.app |

Nenhuma dessas contas exige cartão de crédito. Todas têm free tier suficiente para uso acadêmico.

## Passo 1 — Banco de dados (Neon.tech)

1. Criar conta em neon.tech (login com GitHub facilita)
2. Criar novo projeto — nome: `apex-security`
3. Copiar a **Connection String** fornecida (formato `postgresql://...`)
4. Rodar as migrações — ver seção "Criar tabelas" abaixo

## Passo 2 — Backend (Render.com)

1. Criar conta em render.com (login com GitHub facilita)
2. **New +** → **Web Service** → conectar o repositório `Apex-Security`
3. O Render vai detectar o `render.yaml` automaticamente
4. Preencher as variáveis marcadas como `sync: false`:
   - `DATABASE_URL` (da Neon, passo 1)
   - `GEMINI_API_KEY`
   - `GITHUB_TOKEN`
   - `FRONTEND_URL` (preencher DEPOIS do passo 3, com a URL do Vercel)
5. Deploy — aguardar o build completar
6. Copiar a URL gerada (ex: `https://apex-security-api.onrender.com`)

## Passo 3 — Frontend (Vercel)

1. Criar conta em vercel.com (login com GitHub facilita)
2. **Add New** → **Project** → importar o repositório `Apex-Security`
3. **Root Directory:** selecionar `frontend`
4. Adicionar variável de ambiente:
   - `VITE_API_URL` = URL do backend do passo 2 + `/api`
     (ex: `https://apex-security-api.onrender.com/api`)
5. Deploy
6. Copiar a URL gerada (ex: `https://apex-security.vercel.app`)

## Passo 4 — Conectar tudo

1. Voltar no Render → **Environment** → atualizar `FRONTEND_URL` com a URL do Vercel
2. Voltar no GitHub → **Settings → Secrets and variables → Actions**
3. Atualizar o secret `APEX_API_URL` com a URL do backend do Render
   (permanente, substituindo qualquer URL antiga de ngrok)
4. Fazer um commit de teste e confirmar que o Actions consegue enviar dados
   (com a correção aplicada no workflow, uma falha de envio agora aparece
   claramente como ❌ com o código HTTP — nada mais é mascarado)

## Nota sobre o free tier do Render

O plano gratuito "dorme" o backend após 15 minutos sem requisições.
A primeira chamada depois disso demora 30–50 segundos para responder
enquanto o servidor acorda. Isso é normal e esperado em qualquer
free tier de mercado. Recomenda-se acessar o dashboard alguns minutos
antes de qualquer demonstração ao vivo para garantir que o backend
já esteja ativo.

## Criar tabelas no banco Neon

Após configurar o `DATABASE_URL` do Neon no backend, as tabelas são
criadas automaticamente no primeiro start da aplicação, via
`Base.metadata.create_all(bind=engine)` em `main.py` — não é necessário
rodar SQL manual.
