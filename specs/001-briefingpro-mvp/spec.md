# Spec 001 — BriefingPro MVP

## Visão Geral

**Produto:** BriefingPro
**Versão:** 1.0 (MVP)
**Data:** 2026-06-30
**Tipo:** Sistema Web full-stack (SaaS mono-tenant inicial)

Sistema profissional de coleta de briefing para software houses e freelancers.
Permite criar projetos de briefing, gerar links únicos para clientes preencherem,
acompanhar progresso em tempo real e exportar PDF profissional.

---

## Atores

| Ator | Descrição |
|------|-----------|
| Admin | Freelancer / software house — acesso autenticado via JWT |
| Cliente | Destinatário do briefing — acesso via token único no URL, sem login |

---

## Casos de Uso

### UC-01: Autenticação do Admin
- Admin acessa `/login`
- Submete email + senha
- Recebe JWT (access_token 15min + refresh_token 7d)
- Fica autenticado no dashboard

### UC-02: Criar Projeto de Briefing
- Admin clica "Novo Briefing"
- Preenche: nome do cliente, nome do projeto, email do cliente (opcional)
- Sistema cria registro de projeto + token único (UUID v4)
- Sistema gera link: `https://briefingpro.app/b/{token}`

### UC-03: Acompanhar Progresso
- Dashboard mostra lista de projetos com status:
  - `draft` — criado, link não enviado ao cliente
  - `sent` — link enviado ao cliente
  - `in_progress` — cliente começou a preencher
  - `completed` — cliente finalizou e assinou
- Barra de progresso por step (12 etapas)
- Atualização em tempo real (polling 30s ou SSE)

### UC-04: Cliente Preenche Briefing (Wizard)
- Cliente acessa link `/b/{token}`
- Sistema valida token (404 se inválido, 410 se expirado)
- Wizard de 12 etapas com:
  - Auto-save a cada campo (debounce 2s)
  - Pode fechar e continuar depois (progresso persistido por token)
  - Navegação livre entre etapas já visitadas
  - Validação por etapa antes de avançar

### UC-05: Assinatura Digital
- Etapa 12 exibe resumo completo
- Cliente assina via:
  - Canvas signature (desenho com mouse/touch)
  - OU nome completo digitado como "assinatura eletrônica"
- Timestamp da assinatura registrado
- Status muda para `completed`

### UC-06: Exportar PDF
- Admin clica "Exportar PDF" em qualquer projeto
- Sistema gera PDF profissional com:
  - Capa: logo + dados do cliente + data
  - Índice automático
  - Todas as 12 seções formatadas
  - Assinatura do cliente + timestamp
- Download automático no browser

### UC-07: Visualizar / Editar Respostas
- Admin pode visualizar todas as respostas em modo read-only
- Admin pode editar campos (com log de quem editou)
- Cliente pode editar até assinar (após assinatura: read-only)

---

## Wizard — 12 Etapas

| # | Step | Campos principais | Tipo |
|---|------|-------------------|------|
| 1 | Dados da Empresa | nome, CNPJ, responsável, email, telefone, site | text |
| 2 | Objetivos do Projeto | problema a resolver, público-alvo, proposta de valor, KPIs esperados | textarea |
| 3 | Tipo de Projeto | app mobile, site institucional, sistema web, SaaS, e-commerce, outro | checkbox+icons |
| 4 | Funcionalidades | auth, pagamentos, notificações, relatórios, dashboard, chat, IA, upload, API, outros | checklist categorizada |
| 5 | Requisitos Funcionais | por categoria selecionada na etapa 4, perguntas dinâmicas | textarea dinâmica |
| 6 | Requisitos Não Funcionais | performance (tempo de resposta), segurança (LGPD, dados sensíveis), escalabilidade (volume de usuários), acessibilidade (WCAG) | sliders + radio |
| 7 | Integrações | gateways (Stripe, MP, PagSeguro), ERPs (TOTVS, SAP), redes sociais, Google (Maps, Analytics), outros | checklist + custom |
| 8 | Referências Visuais | upload imagens (max 5, 5MB cada), URLs de referência, paleta de cores, estilo (minimalista, corporativo, colorido, dark) | file upload + color picker |
| 9 | Cronograma | prazo desejado, datas importantes, deadline crítico, flexibilidade | date pickers |
| 10 | Orçamento | faixa de investimento (radio), observações (opcional, pode pular) | radio + optional textarea |
| 11 | Observações Finais | campo livre, anexos adicionais | textarea + file |
| 12 | Revisão e Assinatura | resumo de todas as respostas + canvas signature + nome completo | read-only + canvas |

---

## Modelo de Dados

### Tabela: `users` (admin)
```
id          uuid PK
email       varchar(255) UNIQUE NOT NULL
password    varchar(255) NOT NULL (bcrypt)
name        varchar(255)
logo_url    varchar(500)
created_at  timestamp
updated_at  timestamp
```

### Tabela: `projects`
```
id              uuid PK
user_id         uuid FK users.id
client_name     varchar(255) NOT NULL
project_name    varchar(255) NOT NULL
client_email    varchar(255)
token           uuid UNIQUE NOT NULL (link token)
status          enum(draft, sent, in_progress, completed)
current_step    int DEFAULT 0
completed_steps int[] DEFAULT []
expires_at      timestamp (90 dias)
created_at      timestamp
updated_at      timestamp
```

### Tabela: `briefing_responses`
```
id          uuid PK
project_id  uuid FK projects.id UNIQUE
step_1      jsonb
step_2      jsonb
step_3      jsonb
step_4      jsonb
step_5      jsonb
step_6      jsonb
step_7      jsonb
step_8      jsonb
step_9      jsonb
step_10     jsonb
step_11     jsonb
step_12     jsonb
signature   jsonb (type: canvas|text, value: base64|string, timestamp)
saved_at    timestamp
submitted_at timestamp
```

### Tabela: `uploaded_files`
```
id          uuid PK
project_id  uuid FK projects.id
step        int
filename    varchar(500)
url         varchar(1000)
size_bytes  int
created_at  timestamp
```

---

## API Contracts

### Auth
```
POST /api/auth/login       { email, password } → { access_token, refresh_token }
POST /api/auth/refresh     { refresh_token } → { access_token }
POST /api/auth/logout      (invalidate refresh token)
```

### Projects (Admin — JWT required)
```
GET    /api/projects               → ProjectSummary[]
POST   /api/projects               { client_name, project_name, client_email? } → Project
GET    /api/projects/:id           → Project + responses
PUT    /api/projects/:id           { status, client_name, project_name }
DELETE /api/projects/:id
GET    /api/projects/:id/pdf       → PDF stream (application/pdf)
```

### Briefing (Client — token in URL param)
```
GET    /api/briefing/:token        → { project, responses, current_step }
PATCH  /api/briefing/:token/step/:step  { data: jsonb } → { saved_at }
POST   /api/briefing/:token/submit { signature } → { submitted_at }
POST   /api/briefing/:token/files  multipart/form-data → { url, filename }
```

---

## Stack Técnica

### Backend (apps/backend)
- NestJS 10 + TypeScript
- Drizzle ORM + Neon Postgres
- JWT (access 15min + refresh 7d)
- Multer para upload (S3 ou local no MVP)
- @react-pdf/renderer (ou Puppeteer) para PDF
- Zod para validação
- Jest para testes

### Frontend (apps/frontend)
- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- TanStack Query (server state)
- Framer Motion (animações wizard)
- react-signature-canvas (assinatura)
- Polling via TanStack Query (refetchInterval: 30000)

---

## Requisitos Não-Funcionais

- Auto-save: debounce 2s por campo, save por step
- Token de cliente expira em 90 dias
- PDF gerado server-side (não exposto ao cliente)
- Senhas com bcrypt (rounds: 12)
- CORS configurado para domínio do frontend
- Uploads máximo 5MB por arquivo, 5 arquivos por projeto (MVP)

---

## Fora do Escopo (MVP)

- Multi-tenant (múltiplos admins)
- Templates de briefing customizáveis
- Notificações por email automáticas
- Integração com CRMs
- Analytics de briefing
- Mobile app nativo
