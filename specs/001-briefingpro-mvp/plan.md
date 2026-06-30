# Plan 001 — BriefingPro MVP

## Arquitetura

```
briefing-pro/
├── apps/
│   ├── backend/          NestJS 10 + Drizzle + Neon Postgres
│   └── frontend/         Next.js 15 App Router + shadcn/ui
├── specs/
│   └── 001-briefingpro-mvp/
└── .gitignore
```

### Monorepo simples (sem Turborepo no MVP)
Dois apps independentes com scripts separados. Backend roda na porta 3001,
frontend na 3000. Em produção: Vercel (frontend) + Railway (backend).

---

## Fases de Implementação

### FASE 1 — Backend: Foundation (Prioridade Alta)

**1.1 Setup NestJS**
- `nest new backend --package-manager pnpm`
- Config: TypeScript strict, ESLint, Prettier
- Variáveis de ambiente: `@nestjs/config` + Zod schema validation
- Health check endpoint: `GET /api/health`

**1.2 Schema Drizzle + Neon**
- Conexão com Neon Postgres via `@neondatabase/serverless`
- Tabelas: `users`, `projects`, `briefing_responses`, `uploaded_files`
- Migration com `drizzle-kit push`

**1.3 Auth Module**
- `POST /api/auth/login` — bcrypt compare + JWT issuing
- `POST /api/auth/refresh` — refresh token rotation
- JwtAuthGuard para rotas protegidas
- Seed com admin padrão para desenvolvimento

**1.4 Projects Module (Admin)**
- CRUD completo de projetos
- Geração de token UUID v4 único
- Cálculo de `current_step` e `completed_steps[]`

**1.5 Briefing Module (Client)**
- `GET /api/briefing/:token` — load com validação de expiração
- `PATCH /api/briefing/:token/step/:step` — auto-save por step
- `POST /api/briefing/:token/submit` — finalização + assinatura
- Mudança de status automática: `sent` → `in_progress` → `completed`

**1.6 File Upload**
- Multer para receber arquivos
- Storage local (MVP) ou S3 opcional
- Validação: max 5MB, tipos permitidos (image/*, application/pdf)

**1.7 PDF Export**
- Endpoint `GET /api/projects/:id/pdf`
- Implementar com `@react-pdf/renderer` server-side
- Layout: capa navy + seções internas + assinatura

---

### FASE 2 — Frontend: Admin Panel (Prioridade Alta)

**2.1 Setup Next.js 15**
- `npx create-next-app@latest frontend --typescript --tailwind --app`
- shadcn/ui init + Inter font
- TanStack Query setup
- Axios instance com interceptor de token

**2.2 Landing + Login**
- `/` — Landing page com hero dark navy, feature cards, CTA
- `/login` — Formulário RHF+Zod, integração com `POST /api/auth/login`
- Token storage: httpOnly cookie via Next.js route handler

**2.3 Dashboard**
- `/dashboard` — stats cards + tabela de projetos
- Layout com sidebar dark + top bar
- TanStack Query polling 30s para status updates
- Empty state ilustrado

**2.4 Gerenciar Projeto**
- `/dashboard/projects/new` — modal/form criar projeto
- `/dashboard/projects/:id` — detalhes + respostas (read-only)
- Ação: copiar link, exportar PDF, alterar status

---

### FASE 3 — Frontend: Wizard do Cliente (Prioridade Máxima MVP)

**3.1 Rota pública**
- `/b/[token]` — sem auth, valida token via `GET /api/briefing/:token`
- Loading skeleton enquanto carrega
- 404 elegante para token inválido
- 410 Gone para token expirado

**3.2 Wizard Container**
- Progress bar animada (12 steps)
- Step component dinâmico via switch/map
- Auto-save: `useDebouncedCallback(save, 2000)`
- Estado local + sync com server
- Framer Motion: animação slide horizontal entre steps

**3.3 Steps 1–4 (formulários básicos)**
- Step 1: campos de texto/mask para CNPJ
- Step 2: textareas com contador de caracteres
- Step 3: cards com ícones selecionáveis (múltipla escolha)
- Step 4: checklist categorizada com checkboxes customizados

**3.4 Steps 5–8 (dinâmicos + uploads)**
- Step 5: perguntas dinâmicas baseadas em seleções do step 4
- Step 6: sliders + radio groups custom
- Step 7: checklist integrações + campo custom
- Step 8: drag-and-drop upload + color picker + estilo selecionável

**3.5 Steps 9–12 (timeline + assinatura)**
- Step 9: date pickers (calendário)
- Step 10: radio group de faixas de orçamento (skippable)
- Step 11: textarea livre + upload adicional
- Step 12: resumo completo + `react-signature-canvas` + submit

---

### FASE 4 — Polish + Deploy (Prioridade Média)

- Toasts com Sonner para feedback de auto-save
- Tratamento de erros globais (React Error Boundary)
- SEO meta tags nas páginas públicas
- Deploy backend no Railway com envs
- Deploy frontend no Vercel com envs
- Teste end-to-end manual do fluxo completo

---

## Data Model — Drizzle Schema

```typescript
// schema.ts
export const users = pgTable('users', {
  id:         uuid('id').primaryKey().defaultRandom(),
  email:      varchar('email', { length: 255 }).notNull().unique(),
  password:   varchar('password', { length: 255 }).notNull(),
  name:       varchar('name', { length: 255 }),
  logo_url:   varchar('logo_url', { length: 500 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id:               uuid('id').primaryKey().defaultRandom(),
  user_id:          uuid('user_id').notNull().references(() => users.id),
  client_name:      varchar('client_name', { length: 255 }).notNull(),
  project_name:     varchar('project_name', { length: 255 }).notNull(),
  client_email:     varchar('client_email', { length: 255 }),
  token:            uuid('token').notNull().unique().defaultRandom(),
  status:           projectStatusEnum.notNull().default('draft'),
  current_step:     integer('current_step').default(0),
  completed_steps:  integer('completed_steps').array().default([]),
  expires_at:       timestamp('expires_at'),
  created_at:       timestamp('created_at').defaultNow(),
  updated_at:       timestamp('updated_at').defaultNow(),
});

export const briefingResponses = pgTable('briefing_responses', {
  id:           uuid('id').primaryKey().defaultRandom(),
  project_id:   uuid('project_id').notNull().references(() => projects.id).unique(),
  step_1:       jsonb('step_1'),
  // ... step_2 through step_12
  signature:    jsonb('signature'),
  saved_at:     timestamp('saved_at'),
  submitted_at: timestamp('submitted_at'),
});
```

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| PDF pesado server-side | Cache do PDF gerado por 24h, regenera se houver update |
| Upload de imagem grande | Validação client-side + server-side antes de salvar |
| Token expirado enquanto cliente preenche | Toast de aviso + opção de solicitar novo link ao admin |
| Auto-save falha silenciosamente | Indicador de status "Salvo" / "Salvando..." / "Falha — tentando novamente" |
