# Tasks 001 — BriefingPro MVP

Prioridade: BACKEND primeiro (F1-F7) → FRONTEND Wizard (F8-F15) → Dashboard (F16-F21) → Polish (F22+)

---

## BACKEND — NestJS + Drizzle + Neon

### F1 — Setup inicial do backend
- [ ] `nest new apps/backend --package-manager pnpm`
- [ ] Configurar `@nestjs/config` com Zod validation schema
- [ ] `.env.example` com todas as variáveis necessárias
- [ ] Endpoint `GET /api/health` retornando `{ status: 'ok', timestamp }`
- [ ] CORS configurado para localhost:3000 + variável de env para produção
- [ ] Prettier + ESLint configurados

### F2 — Schema Drizzle + conexão Neon
- [ ] Instalar: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`
- [ ] `src/database/schema.ts` com todas as tabelas (users, projects, briefing_responses, uploaded_files)
- [ ] `drizzle.config.ts` apontando para Neon
- [ ] `drizzle-kit push` funcionando
- [ ] `DatabaseModule` global com provider de conexão
- [ ] Seed script: criar admin padrão `admin@briefingpro.test` / `Admin@123`

### F3 — Auth Module
- [ ] `AuthModule` com `AuthController`, `AuthService`
- [ ] `POST /api/auth/login` — bcrypt.compare + gerar access_token (15min) + refresh_token (7d)
- [ ] `POST /api/auth/refresh` — validar refresh + emitir novo access_token
- [ ] `POST /api/auth/logout` — invalidar refresh (blacklist em memória ou DB)
- [ ] `JwtAuthGuard` para proteger rotas do admin
- [ ] Testes unitários: AuthService (mock DB)

### F4 — Projects Module (Admin)
- [ ] `ProjectsModule` com `ProjectsController`, `ProjectsService`, `ProjectsRepository`
- [ ] `GET /api/projects` — listar projetos do admin autenticado (com stats aggregadas)
- [ ] `POST /api/projects` — criar projeto, gerar token UUID, criar `briefing_responses` vazio, setar `expires_at` = now + 90d
- [ ] `GET /api/projects/:id` — detalhes + responses completas
- [ ] `PUT /api/projects/:id` — editar dados básicos
- [ ] `DELETE /api/projects/:id` — soft delete
- [ ] DTOs com class-validator
- [ ] Testes unitários: ProjectsService

### F5 — Briefing Module (Client)
- [ ] `BriefingModule` com `BriefingController`, `BriefingService`
- [ ] `GET /api/briefing/:token` — load project + responses (validar token existe e não expirou; 404/410)
- [ ] `PATCH /api/briefing/:token/step/:step` — salvar step (upsert no jsonb do step); mudar status para `in_progress` se era `sent`/`draft`
- [ ] `POST /api/briefing/:token/submit` — receber signature, setar `submitted_at`, mudar status para `completed`
- [ ] Guard de token (TokenGuard) validando expiração
- [ ] Testes unitários: BriefingService

### F6 — File Upload
- [ ] `FilesModule` com Multer
- [ ] `POST /api/briefing/:token/files` — receber arquivo (max 5MB), salvar local em `uploads/` (MVP), gravar em `uploaded_files`
- [ ] `GET /api/uploads/:filename` — servir arquivos (static ou stream)
- [ ] Validação: tipo MIME + tamanho
- [ ] Máximo 10 arquivos por projeto (retornar 400 se exceder)

### F7 — PDF Export
- [ ] Instalar `@react-pdf/renderer` no backend
- [ ] `GET /api/projects/:id/pdf` — protegido por JWT
- [ ] `PdfService.generate(project, responses)` retorna Buffer
- [ ] Layout PDF:
  - Capa: fundo navy, título, cliente, data, assinatura
  - Seções 1–11: título azul, conteúdo clean
  - Tabelas com zebra stripe
  - Footer com número de página
- [ ] Header HTTP: `Content-Disposition: attachment; filename="briefing-[client]-[date].pdf"`
- [ ] Testes manuais com projeto completo preenchido

---

## FRONTEND — Wizard do Cliente (MVP Core)

### F8 — Setup Next.js 15 + Design System
- [ ] `npx create-next-app@latest apps/frontend --typescript --tailwind --app`
- [ ] shadcn/ui init (`npx shadcn@latest init`)
- [ ] Inter font via `next/font/google`
- [ ] `tailwind.config.ts` com cores customizadas (navy, accent, gold)
- [ ] `globals.css` com variáveis CSS do design system
- [ ] Instalar: `framer-motion`, `react-signature-canvas`, `react-hook-form`, `zod`, `@tanstack/react-query`, `axios`, `sonner`
- [ ] Axios instance em `src/lib/api.ts`
- [ ] TanStack Query Provider em `app/providers.tsx`

### F9 — Landing Page + Login Admin
- [ ] `app/page.tsx` — Landing page:
  - Hero section com gradiente dark navy → azul escuro
  - Headline + sub-headline + CTA button com glow
  - 3 feature cards com ícones Lucide
  - Social proof row
  - Footer
- [ ] `app/login/page.tsx` — Login form:
  - RHF + Zod schema
  - POST /api/auth/login
  - Redireciona para /dashboard após sucesso
  - Error toast no caso de credenciais inválidas

### F10 — Rota pública do Wizard
- [ ] `app/b/[token]/page.tsx` — rota pública (sem auth)
- [ ] `GET /api/briefing/:token` no load
- [ ] Loading: skeleton screens (progress bar + card)
- [ ] Error states:
  - Token inválido: 404 elegante com ilustração
  - Token expirado: 410 com instrução para contatar o profissional
  - Briefing já concluído: read-only summary

### F11 — Wizard Container + Progress Bar
- [ ] `WizardContainer` component:
  - Progress bar animada no topo (framer-motion)
  - Step counter: "Etapa X de 12"
  - Step name no header
  - Card central max-w-2xl
- [ ] `useWizard` hook:
  - `currentStep`, `goNext()`, `goPrev()`, `goToStep(n)`
  - `completedSteps: Set<number>`
  - Não permite avançar sem validar step atual
- [ ] Framer Motion: slide horizontal entre steps
- [ ] Botões Anterior / Próximo com estados loading

### F12 — Auto-save + Status Indicator
- [ ] `useAutoSave` hook:
  - `useDebouncedCallback(saveStep, 2000)`
  - Chama `PATCH /api/briefing/:token/step/:step`
  - Status: "Salvando..." | "Salvo" | "Falha"
- [ ] Indicador visual no canto superior direito do card
- [ ] Toast de erro se salvar falhar 3x seguidos

### F13 — Steps 1–6 (Formulários)
- [ ] Step 1: Dados da Empresa
  - Campos: nome empresa, CNPJ (mask), responsável, email, telefone, site
  - Validação Zod inline
- [ ] Step 2: Objetivos
  - 4 textareas com contador de caracteres (max 500 cada)
  - Labels descritivos
- [ ] Step 3: Tipo de Projeto
  - Grid de cards selecionáveis com ícone + label
  - Múltipla seleção + campo "outro" custom
- [ ] Step 4: Funcionalidades
  - Checklist categorizada: Auth, Pagamentos, Comunicação, Analytics, Infraestrutura, IA
  - Checkbox custom estilizado
  - Campo para adicionar funcionalidade custom
- [ ] Step 5: Requisitos Funcionais
  - Perguntas dinâmicas baseadas em seleções do step 4
  - Textarea por categoria selecionada
- [ ] Step 6: Requisitos Não Funcionais
  - Performance: slider 0–5 (tempo de resposta esperado)
  - Segurança: radio (baixo / médio / alto + LGPD)
  - Escalabilidade: input número de usuários esperados
  - Acessibilidade: checkbox WCAG A / AA / AAA

### F14 — Steps 7–11 (Upload + Datas)
- [ ] Step 7: Integrações
  - Checklist: pagamentos, ERPs, sociais, Google, outros
  - Campo custom para integrações não listadas
- [ ] Step 8: Referências Visuais
  - Drag-and-drop upload (máx 5 imagens, 5MB cada)
  - Preview das imagens enviadas com botão remover
  - Campo URLs de referência (dinâmico, add/remove)
  - Color picker (3 cores: primária, secundária, terciária)
  - Estilo visual: cards selecionáveis (minimalista / corporativo / colorido / dark)
- [ ] Step 9: Cronograma
  - Date picker prazo desejado
  - Date picker deadline crítico (opcional)
  - Datas importantes (lista dinâmica)
  - Radio: flexibilidade (muito flexível / pode negociar / prazo fixo)
- [ ] Step 10: Orçamento
  - Radio group com faixas de investimento
  - "Prefiro não informar" como opção válida
  - Textarea observações (opcional)
  - Botão "Pular esta etapa"
- [ ] Step 11: Observações Finais
  - Textarea livre
  - Upload arquivos adicionais (PDF, DOCX)

### F15 — Step 12: Revisão e Assinatura
- [ ] Resumo completo de todas as respostas (read-only, colapsável por seção)
- [ ] `react-signature-canvas` para assinatura desenhada
  - Botão "Limpar" para recomeçar
- [ ] Alternativa: campo "Nome completo como assinatura eletrônica"
- [ ] Toggle entre canvas e texto
- [ ] Botão "Confirmar e Enviar" com loading state
- [ ] Sucesso: animação de check + mensagem de agradecimento + timestamp

---

## FRONTEND — Dashboard Admin

### F16 — Layout do Dashboard
- [ ] `app/dashboard/layout.tsx`:
  - Sidebar dark (#0A0F1E) com logo + nav
  - Navigation items: Dashboard, Projetos, Configurações
  - Hover state azul + indicador de rota ativa
  - Top bar: search + avatar + logout
  - Responsivo: hamburger menu no mobile

### F17 — Dashboard Home
- [ ] `app/dashboard/page.tsx`:
  - 4 Stats cards: Total / Aguardando / Concluídos / Taxa
  - TanStack Query com `refetchInterval: 30000`
  - Tabela recente de projetos (últimos 5)
  - Empty state ilustrado

### F18 — Lista de Projetos
- [ ] `app/dashboard/projects/page.tsx`:
  - Tabela completa: Nome Cliente / Projeto / Status / Progresso / Data / Ações
  - Status badges pill style (cores por status)
  - Barra de progresso por projeto (steps 0/12)
  - Ações: copiar link / ver detalhes / exportar PDF / deletar

### F19 — Criar Projeto
- [ ] Dialog/Modal "Novo Briefing":
  - RHF + Zod: nome cliente, nome projeto, email cliente (opcional)
  - POST /api/projects
  - Exibe link gerado com botão "Copiar"
  - Toast de sucesso

### F20 — Detalhe do Projeto
- [ ] `app/dashboard/projects/[id]/page.tsx`:
  - Cabeçalho: nome do projeto + status badge + ações
  - Link do cliente com botão copiar + QR code (opcional)
  - Visualizador de respostas por seção (accordion)
  - Botão "Exportar PDF" (download)
  - Última atividade do cliente

### F21 — Middleware de Auth
- [ ] `middleware.ts` Next.js:
  - Proteger `/dashboard/**` — redireciona para `/login` se sem token
  - Redirecionar `/login` para `/dashboard` se já autenticado
- [ ] `useAuth` hook com refresh automático
- [ ] Logout limpa cookies e redireciona

---

## POLISH + DEPLOY

### F22 — Polish UX
- [ ] Sonner toasts configurados (dark style)
- [ ] Error boundaries em páginas críticas
- [ ] Skeleton screens em todas as páginas com loading
- [ ] Confirmar micro-interações: hover cards, progress bar animada
- [ ] SEO: metadata em páginas públicas

### F23 — Deploy
- [ ] Backend: Railway
  - `Dockerfile` ou `nixpacks`
  - Variáveis de ambiente configuradas
  - Health check endpoint
- [ ] Frontend: Vercel
  - `NEXT_PUBLIC_API_URL` apontando para Railway
  - Preview deployments por branch
- [ ] Testar fluxo completo em produção:
  1. Admin cria projeto
  2. Copia link e acessa no mobile
  3. Preenche wizard completo
  4. Admin exporta PDF
  5. PDF baixado corretamente

---

## Critérios de Aceite do MVP

- [ ] Admin consegue criar projeto e copiar link em < 30 segundos
- [ ] Cliente consegue preencher wizard do zero até assinatura sem login
- [ ] Auto-save funciona: fechar browser e reabrir mantém progresso
- [ ] PDF gerado com todas as seções preenchidas, layout profissional
- [ ] Dashboard mostra status atualizado dentro de 30 segundos após mudança do cliente
- [ ] Funciona em mobile (wizard) e desktop (dashboard)
