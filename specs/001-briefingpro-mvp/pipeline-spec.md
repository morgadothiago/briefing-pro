# Pipeline de Vendas — BriefingPro (Expansão de Escopo)

## Visão do Produto (Revisada)

BriefingPro é um **pipeline de vendas / onboarding completo** para software houses.
Vai além do briefing isolado: rastreia cada fase do processo comercial, do primeiro
contato até o início do projeto.

---

## Fases do Pipeline (10 estágios)

| Fase | Status Interno | Descrição |
|------|---------------|-----------|
| 1 | `LEAD` | Cliente entrou em contato / admin criou lead |
| 2 | `CONTATO_FEITO` | Email de boas-vindas + link enviado |
| 3a | `FORMULARIO_ENVIADO` | Wizard disponível para cliente |
| 3b | `FORMULARIO_PREENCHIDO` | Cliente completou e assinou wizard |
| 4a | `EM_ANALISE` | Admin revisando respostas |
| 4b | `ANALISADO` | Admin marcou como analisado |
| 5a | `REUNIAO_AGENDADA` | Data/hora definida + email enviado |
| 5b | `REUNIAO_REALIZADA` | Admin marcou como concluída |
| 6a | `ESCOPO_GERADO` | Doc de escopo criado |
| 6b | `ESCOPO_APROVADO` | Cliente aprovou escopo |
| 7a | `PROPOSTA_ENVIADA` | Proposta comercial enviada |
| 7b | `PROPOSTA_ACEITA` | Cliente aceitou |
| 7c | `PROPOSTA_REJEITADA` | Cliente rejeitou (com motivo) |
| 8a | `CONTRATO_ENVIADO` | Contrato gerado e enviado |
| 8b | `CONTRATO_ASSINADO` | Ambas as partes assinaram |
| 9a | `AGUARDANDO_PAGAMENTO` | Link de pagamento gerado |
| 9b | `PAGO_PARCIAL` | Primeiro pagamento recebido |
| 9c | `PAGO_TOTAL` | Pagamento integral confirmado |
| 10 | `PROJETO_INICIADO` | Projeto em andamento |

---

## Dashboard Principal — Kanban

- Colunas representam as **fases macro** (não todos os sub-status):
  - Novo Lead | Formulário | Análise | Reunião | Escopo | Proposta | Contrato | Pagamento | Em Andamento
- Cards arrastáveis entre colunas (drag-and-drop com `@dnd-kit/core`)
- Card mostra: nome do cliente, projeto, valor estimado, último update, avatar
- Filtros: por status / por data / por valor estimado
- Métricas no topo (4 cards):
  - Leads este mês | Taxa de conversão | Valor em pipeline | Contratos fechados

---

## Emails Automáticos (Resend API)

### Templates obrigatórios (MVP)
1. **Boas-vindas + link do formulário** — disparado ao criar lead (fase 2)
2. **Lembrete formulário** — 48h sem preenchimento (cron job)
3. **Confirmação de recebimento** — quando wizard é submetido
4. **Convite para reunião** — quando admin agenda
5. **Lembrete de reunião** — 1 dia antes + 1 hora antes (cron jobs)
6. **Escopo disponível para revisão** — fase 6a
7. **Proposta comercial** — fase 7a
8. **Contrato para assinatura** — fase 8a
9. **Confirmação de pagamento** — fase 9c
10. **Kick-off do projeto** — fase 10

### Configuração
- Admin cadastra `RESEND_API_KEY` em Configurações
- Templates editáveis em `/dashboard/settings/email-templates`
- Variáveis dinâmicas: `{{client_name}}`, `{{project_name}}`, `{{link}}`, `{{date}}`, etc.

---

## Fase 4 — Análise + Notas Internas

- Admin vê todas as respostas organizadas por seção
- Campo de notas internas (não visível ao cliente)
- Botão "Gerar rascunho de escopo" (pré-preenche fase 6 com base nas respostas)
- Marcar como "Analisado" para avançar fase

---

## Fase 5 — Reunião

- Admin define: data, hora, link Google Meet / Zoom (campo manual) ou Calendly URL
- Emails automáticos de convite e lembretes
- Após reunião: campo de notas da reunião
- Status: `REUNIAO_AGENDADA` → `REUNIAO_REALIZADA`

---

## Fase 6 — Documento de Escopo

Documento diferente do briefing bruto. É o escopo OFICIAL pós-análise.

**Seções do Escopo:**
1. Resumo executivo
2. Funcionalidades acordadas (lista priorizada)
3. O que está FORA do escopo
4. Stack tecnológica sugerida
5. Cronograma estimado (fases + milestones)
6. Premissas e riscos
7. Próximos passos

**Interação:**
- Admin edita o escopo em editor rico (ou formulário estruturado)
- Export PDF profissional
- Link público de revisão para cliente (read-only)
- Cliente pode aprovar ou comentar

---

## Fase 7 — Proposta Comercial

**Campos:**
- Valor total
- Formas de pagamento (parcelamento, entrada, mensalidade)
- Validade da proposta (data)
- Itens inclusos (lista)
- Garantias e suporte pós-entrega
- Observações

**Visualização:**
- Link público com design profissional (não PDF bruto)
- Página `/proposal/:token` com layout comercial bonito
- Botão "Aceitar Proposta" / "Solicitar Ajustes"

---

## Fase 8 — Contrato

**Template padrão com campos:**
- Partes (preenche automaticamente com dados do projeto)
- Objeto do contrato
- Valor e forma de pagamento
- Prazo de entrega
- Cláusulas padrão (editáveis pelo admin nas configurações)
- Foro

**Assinatura:**
- Admin assina primeiro (canvas)
- Cliente recebe link e assina (canvas)
- Ambas as assinaturas + IP + timestamp no PDF final

---

## Fase 9 — Pagamento

**MVP (manual):**
- Admin registra: valor, parcelas, datas de vencimento
- Marcar parcelas como pagas manualmente

**v2 (integração):**
- MercadoPago: PIX + cartão (webhook de confirmação automática)

---

## Fase 10 — Início do Projeto

- Checklist de onboarding:
  - [ ] Repositório criado
  - [ ] Acessos concedidos
  - [ ] Ambiente de desenvolvimento configurado
  - [ ] Kick-off agendado
- Campo: links externos (GitHub, Jira, Notion, Linear)
- Email automático de boas-vindas ao projeto

---

## Configurações do Admin

`/dashboard/settings`:
- **Perfil da empresa:** nome, logo, CNPJ, endereço, email, telefone
- **Email:** Resend API key + sender email + reply-to
- **Templates de email:** editor com preview
- **Templates de documento:** escopo, proposta, contrato (campos padrão)
- **Pagamentos:** MercadoPago credentials (opcional)

---

## Modelo de Dados Expandido

### Tabela: `leads` (substitui/expande `projects`)
```
id                  uuid PK
user_id             uuid FK users.id
client_name         varchar(255) NOT NULL
client_email        varchar(255)
client_phone        varchar(50)
client_company      varchar(255)
project_name        varchar(255) NOT NULL
project_type        varchar(100)  -- resumo do tipo
estimated_value     decimal(10,2)
pipeline_status     enum (todos os status acima)
pipeline_column     int (0-9, coluna no kanban)
briefing_token      uuid UNIQUE
briefing_expires_at timestamp
notes               text (notas internas do admin)
meeting_date        timestamp
meeting_link        varchar(500)
meeting_notes       text
contract_token      uuid UNIQUE
proposal_token      uuid UNIQUE
created_at          timestamp
updated_at          timestamp
```

### Tabela: `pipeline_events` (log de atividades)
```
id          uuid PK
lead_id     uuid FK leads.id
event_type  varchar(100) (status_changed, email_sent, note_added, etc.)
from_status varchar(100)
to_status   varchar(100)
metadata    jsonb
created_by  varchar(50) (admin | client | system)
created_at  timestamp
```

### Tabela: `emails_sent`
```
id          uuid PK
lead_id     uuid FK leads.id
template    varchar(100)
to_email    varchar(255)
subject     varchar(500)
resend_id   varchar(255)
status      enum(queued, sent, delivered, failed)
sent_at     timestamp
```

### Tabela: `documents` (escopo, proposta, contrato)
```
id              uuid PK
lead_id         uuid FK leads.id
type            enum(scope, proposal, contract)
token           uuid UNIQUE
content         jsonb
pdf_url         varchar(500)
client_approved boolean
client_comment  text
admin_signature jsonb
client_signature jsonb
created_at      timestamp
updated_at      timestamp
```

### Tabela: `payment_installments`
```
id          uuid PK
lead_id     uuid FK leads.id
amount      decimal(10,2)
due_date    date
paid_at     timestamp
method      varchar(50)
notes       text
```

---

## API Routes Expandidas

```
# Leads (pipeline)
GET    /api/leads                          → leads com pipeline_status
POST   /api/leads                          → criar lead + disparar email boas-vindas
GET    /api/leads/:id                      → lead completo + events
PUT    /api/leads/:id                      → editar dados
PATCH  /api/leads/:id/status               → avançar fase + disparar email automático
PATCH  /api/leads/:id/kanban-position      → mover no kanban (coluna)
DELETE /api/leads/:id

# Documentos
POST   /api/leads/:id/documents            { type: scope|proposal|contract, content }
GET    /api/leads/:id/documents/:docId
PUT    /api/leads/:id/documents/:docId
GET    /api/leads/:id/documents/:docId/pdf → download

# Revisão pelo cliente (sem auth)
GET    /api/review/:token                  → documento para revisão
POST   /api/review/:token/approve          { comment? }
POST   /api/review/:token/reject           { comment }
POST   /api/review/:token/sign             { signature }

# Emails
POST   /api/leads/:id/send-email           { template, custom_message? }
GET    /api/leads/:id/emails               → histórico de emails

# Pagamentos
GET    /api/leads/:id/payments
POST   /api/leads/:id/payments             { amount, due_date }
PATCH  /api/leads/:id/payments/:payId/mark-paid

# Settings
GET    /api/settings
PUT    /api/settings                       { company_info, email_config, ... }
GET    /api/settings/email-templates
PUT    /api/settings/email-templates/:key  { subject, body }

# Metrics
GET    /api/metrics                        → { leads_this_month, conversion_rate, pipeline_value, contracts }
```

---

## MVP Prioritário (implementar primeiro)

1. Auth admin (já especificado)
2. Criação de lead + Kanban pipeline visual
3. Wizard formulário cliente (link único via `briefing_token`)
4. Email automático de boas-vindas via Resend
5. Dashboard com progresso por fase
6. Export PDF do briefing (respostas do wizard)

**Fase v2 (pós-MVP):**
- Documentos de escopo/proposta/contrato
- Pagamentos
- Templates editáveis
- Lembretes automáticos por cron
