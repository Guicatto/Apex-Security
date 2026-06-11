# Schema ASU (Apex Standard Unified)

Formato JSON canônico para o qual todo output de scanner é normalizado pelo
módulo `backend/services/normalizer.py` (Módulo 2). Qualquer ferramenta nova
precisa apenas de um parser para este schema — o resto da plataforma não muda.

## Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `str` | UUID gerado internamente |
| `source_tool` | `str` | `"semgrep"` ou `"trivy"` (ou nome da ferramenta desconhecida) |
| `repository` | `str` | Nome do repositório de origem |
| `file_path` | `str \| null` | Caminho do arquivo afetado |
| `line_number` | `int \| null` | Linha do problema |
| `severity` | `str` | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO` |
| `severity_adjusted` | `str` | Severidade após priorização por contexto (Módulo 3) |
| `title` | `str` | Nome curto da vulnerabilidade |
| `description` | `str \| null` | Descrição detalhada |
| `cve_id` | `str \| null` | CVE se disponível |
| `iac_internet_exposed` | `bool \| null` | Exposição à internet segundo o IaC (Módulo 3) |
| `raw_output` | `str` | JSON bruto original preservado para auditoria |
| `timestamp` | `str` | ISO 8601 (UTC) |

## Mapeamento de severidades

| Origem | Valor bruto | ASU |
|---|---|---|
| Semgrep | `error` | `HIGH` |
| Semgrep | `warning` | `MEDIUM` |
| Semgrep | `info` | `INFO` |
| Semgrep | `note` | `LOW` |
| Trivy | `CRITICAL`/`HIGH`/`MEDIUM`/`LOW` | mantidos |
| Trivy | `UNKNOWN` | `INFO` |
| (qualquer) | valor não reconhecido | `INFO` |

## Comportamento com entradas problemáticas

- JSON inválido → `ValueError` (a API responde 400)
- Ferramenta desconhecida → alerta genérico `INFO` com `raw_output` preservado (não quebra)
- Campos ausentes → defaults seguros (`None`/listas vazias), cobertos por testes
