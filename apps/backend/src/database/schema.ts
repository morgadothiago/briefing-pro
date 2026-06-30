import {
  pgTable, uuid, varchar, text, timestamp, decimal,
  integer, jsonb, boolean, pgEnum,
} from 'drizzle-orm/pg-core'

// Enums
export const pipelineStatusEnum = pgEnum('pipeline_status', [
  'LEAD', 'CONTATO_FEITO', 'FORMULARIO_ENVIADO', 'FORMULARIO_PREENCHIDO',
  'EM_ANALISE', 'ANALISADO', 'REUNIAO_AGENDADA', 'REUNIAO_REALIZADA',
  'ESCOPO_GERADO', 'ESCOPO_APROVADO', 'PROPOSTA_ENVIADA', 'PROPOSTA_ACEITA',
  'PROPOSTA_REJEITADA', 'CONTRATO_ENVIADO', 'CONTRATO_ASSINADO',
  'AGUARDANDO_PAGAMENTO', 'PAGO_PARCIAL', 'PAGO_TOTAL', 'PROJETO_INICIADO',
])

export const emailStatusEnum = pgEnum('email_status', ['queued', 'sent', 'delivered', 'failed'])

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  logoUrl: varchar('logo_url', { length: 500 }),
  refreshToken: varchar('refresh_token', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientEmail: varchar('client_email', { length: 255 }),
  clientPhone: varchar('client_phone', { length: 50 }),
  clientCompany: varchar('client_company', { length: 255 }),
  projectName: varchar('project_name', { length: 255 }).notNull(),
  projectType: varchar('project_type', { length: 100 }),
  estimatedValue: decimal('estimated_value', { precision: 10, scale: 2 }),
  pipelineStatus: pipelineStatusEnum('pipeline_status').default('LEAD').notNull(),
  pipelineColumn: integer('pipeline_column').default(0),
  briefingToken: uuid('briefing_token').defaultRandom().unique(),
  briefingExpiresAt: timestamp('briefing_expires_at'),
  notes: text('notes'),
  meetingDate: timestamp('meeting_date'),
  meetingLink: varchar('meeting_link', { length: 500 }),
  meetingNotes: text('meeting_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const briefingResponses = pgTable('briefing_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leads.id).unique().notNull(),
  step1: jsonb('step_1'),
  step2: jsonb('step_2'),
  step3: jsonb('step_3'),
  step4: jsonb('step_4'),
  step5: jsonb('step_5'),
  step6: jsonb('step_6'),
  step7: jsonb('step_7'),
  step8: jsonb('step_8'),
  step9: jsonb('step_9'),
  step10: jsonb('step_10'),
  step11: jsonb('step_11'),
  step12: jsonb('step_12'),
  currentStep: integer('current_step').default(0),
  completedSteps: jsonb('completed_steps').default([]),
  signature: jsonb('signature'),
  savedAt: timestamp('saved_at'),
  submittedAt: timestamp('submitted_at'),
})

export const pipelineEvents = pgTable('pipeline_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leads.id).notNull(),
  eventType: varchar('event_type', { length: 100 }),
  fromStatus: varchar('from_status', { length: 100 }),
  toStatus: varchar('to_status', { length: 100 }),
  metadata: jsonb('metadata'),
  createdBy: varchar('created_by', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const emailsSent = pgTable('emails_sent', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leads.id).notNull(),
  template: varchar('template', { length: 100 }),
  toEmail: varchar('to_email', { length: 255 }),
  subject: varchar('subject', { length: 500 }),
  resendId: varchar('resend_id', { length: 255 }),
  status: emailStatusEnum('status').default('queued'),
  sentAt: timestamp('sent_at'),
})

export const uploadedFiles = pgTable('uploaded_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leads.id).notNull(),
  step: integer('step'),
  filename: varchar('filename', { length: 500 }),
  originalName: varchar('original_name', { length: 500 }),
  mimeType: varchar('mime_type', { length: 100 }),
  sizeBytes: integer('size_bytes'),
  url: varchar('url', { length: 1000 }),
  createdAt: timestamp('created_at').defaultNow(),
})
