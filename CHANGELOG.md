# Changelog — Apex Security

## v2.0.0 — 2026-07-24

Grande atualização de produto: sidebar de conta, fallback de múltiplas chaves do Gemini,
sistema de contato, notificações via Discord, Modo Demo, relatórios em PDF e
Security Health Score.

### Adicionado

- Sidebar lateral com acesso a Chave de Integração, Conta, Contato e Notificações
- Fallback automático entre múltiplas chaves do Gemini
- Formulário de contato com envio de email
- Integração de notificações via webhook do Discord
- Modo Demo com dados fictícios instantâneos
- Geração de relatório PDF nas páginas Alertas e Risco Real
- Security Health Score na página de Alertas
- Timestamp em cada alerta

### Alterado

- Botão "Sair" saiu do header e passou a viver na página Conta (acessível pela sidebar)
- Chamadas ao Gemini centralizadas em `services/gemini_client.py`
- Projeto versionado formalmente: arquivo `VERSION` e este `CHANGELOG.md`

### Corrigido

- Chave de integração agora pode ser consultada a qualquer momento (antes só aparecia
  uma vez, no signup — quem perdesse ficava sem conseguir conectar repositórios)

## v1.x — Histórico resumido

- **v1.0**: Módulos 1-6 (pipeline, ASU, priorização, DLP, remediação, PR) + dashboard React
- **v1.1**: Deploy em produção (Render + Neon + Vercel), correção de bug de sincronização
- **v1.2**: Módulo 7 (Isolation Forest) e Módulo 8 (Intent Checker) com interface visual
- **v1.3**: Módulo 9 (Risco Real — FAIR/LGPD/Blast Radius), correção crítica do GITHUB_TOKEN
- **v1.4**: Módulo 10 (autenticação multi-tenant), SLA de compliance, Módulo 11 (Radar)
