import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { eq, and } from 'drizzle-orm'
import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, renderToBuffer,
} from '@react-pdf/renderer'
import { DB } from '../database/database.module'
import * as schema from '../database/schema'
import { leads, briefingResponses } from '../database/schema'

type Lead = typeof schema.leads.$inferSelect
type BriefingResponse = typeof schema.briefingResponses.$inferSelect

const styles = StyleSheet.create({
  cover: {
    backgroundColor: '#0A0F1E',
    flex: 1,
    padding: 60,
    justifyContent: 'center',
  },
  coverBrand: { fontSize: 36, color: '#ffffff', fontWeight: 'bold', marginBottom: 8 },
  coverTitle: { fontSize: 24, color: '#ffffff', marginTop: 48, marginBottom: 8 },
  coverSub: { fontSize: 14, color: '#94A3B8' },
  coverDate: { fontSize: 12, color: '#64748B', marginTop: 48 },
  page: { backgroundColor: '#ffffff', padding: 48 },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    marginBottom: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 11, color: '#3B82F6', fontWeight: 'bold' },
  headerSub: { fontSize: 9, color: '#94A3B8' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, color: '#3B82F6', fontWeight: 'bold', marginBottom: 8 },
  separator: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { fontSize: 9, color: '#94A3B8', width: 120 },
  value: { fontSize: 10, color: '#1E293B', flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { fontSize: 8, color: '#94A3B8' },
  signatureBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 16,
    marginTop: 8,
  },
  signatureText: { fontSize: 10, color: '#1E293B' },
  signatureLabel: { fontSize: 9, color: '#94A3B8', marginTop: 4 },
})

function CoverPage({ lead }: { lead: Lead }) {
  const date = lead.updatedAt
    ? new Date(lead.updatedAt).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR')

  return React.createElement(
    Page,
    { size: 'A4' },
    React.createElement(
      View,
      { style: styles.cover },
      React.createElement(Text, { style: styles.coverBrand }, 'BriefingPro'),
      React.createElement(Text, { style: styles.coverTitle }, lead.projectName),
      React.createElement(Text, { style: styles.coverSub }, `Cliente: ${lead.clientName}`),
      lead.clientCompany
        ? React.createElement(
            Text,
            { style: { ...styles.coverSub, marginTop: 4 } },
            lead.clientCompany,
          )
        : null,
      React.createElement(Text, { style: styles.coverDate }, `Preenchido em: ${date}`),
    ),
  )
}

function StepSection({
  title,
  data,
}: {
  title: string
  data: Record<string, unknown> | null | undefined
}) {
  if (!data) return null
  const entries = Object.entries(data).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  )
  if (entries.length === 0) return null

  return React.createElement(
    View,
    { style: styles.section },
    React.createElement(Text, { style: styles.sectionTitle }, title),
    React.createElement(View, { style: styles.separator }),
    ...entries.map(([k, v]) =>
      React.createElement(
        View,
        { key: k, style: styles.row },
        React.createElement(Text, { style: styles.label }, k),
        React.createElement(Text, { style: styles.value }, String(v)),
      ),
    ),
  )
}

function ContentPage({
  lead,
  briefing,
  pageNumber,
  totalPages,
}: {
  lead: Lead
  briefing: BriefingResponse | null
  pageNumber: number
  totalPages: number
}) {
  const steps = [
    { key: 'step1', title: 'Dados da Empresa' },
    { key: 'step2', title: 'Objetivos' },
    { key: 'step3', title: 'Tipo de Projeto' },
    { key: 'step4', title: 'Funcionalidades' },
    { key: 'step5', title: 'Requisitos Funcionais' },
    { key: 'step6', title: 'Requisitos Não Funcionais' },
    { key: 'step7', title: 'Integrações' },
    { key: 'step8', title: 'Referências Visuais' },
    { key: 'step9', title: 'Cronograma' },
    { key: 'step10', title: 'Orçamento' },
    { key: 'step11', title: 'Observações Finais' },
    { key: 'step12', title: 'Revisão' },
  ] as const

  const sig = briefing?.signature as
    | { type?: string; value?: string; timestamp?: string }
    | null

  return React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(
      View,
      { style: styles.header },
      React.createElement(Text, { style: styles.headerTitle }, lead.projectName),
      React.createElement(Text, { style: styles.headerSub }, lead.clientName),
    ),
    ...steps.map((s) =>
      React.createElement(StepSection, {
        key: s.key,
        title: s.title,
        data: briefing?.[s.key] as Record<string, unknown> | null,
      }),
    ),
    sig
      ? React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Assinatura do Cliente'),
          React.createElement(View, { style: styles.separator }),
          React.createElement(
            View,
            { style: styles.signatureBox },
            React.createElement(
              Text,
              { style: styles.signatureText },
              sig.type === 'text'
                ? (sig.value ?? '')
                : '[Assinatura digital registrada]',
            ),
            React.createElement(
              Text,
              { style: styles.signatureLabel },
              `Assinatura Eletrônica — ${sig.timestamp ? new Date(sig.timestamp).toLocaleString('pt-BR') : ''}`,
            ),
          ),
        )
      : null,
    React.createElement(
      View,
      { style: styles.footer },
      React.createElement(Text, { style: styles.footerText }, 'BriefingPro'),
      React.createElement(
        Text,
        { style: styles.footerText },
        `Página ${pageNumber} de ${totalPages}`,
      ),
    ),
  )
}

@Injectable()
export class PdfService {
  constructor(@Inject(DB) private db: NeonHttpDatabase<typeof schema>) {}

  async generateBriefingPdf(leadId: string, userId: string): Promise<Buffer> {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.userId, userId)))

    if (!lead) throw new NotFoundException('Lead não encontrado')

    const [briefing] = await this.db
      .select()
      .from(briefingResponses)
      .where(eq(briefingResponses.leadId, leadId))

    const doc = React.createElement(
      Document,
      null,
      React.createElement(CoverPage, { lead }),
      React.createElement(ContentPage, {
        lead,
        briefing: briefing ?? null,
        pageNumber: 2,
        totalPages: 2,
      }),
    )

    return renderToBuffer(doc)
  }
}
