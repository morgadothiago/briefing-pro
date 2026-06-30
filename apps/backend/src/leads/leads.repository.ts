import { Injectable, Inject } from '@nestjs/common'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { eq, desc, and } from 'drizzle-orm'
import { DB } from '../database/database.module'
import * as schema from '../database/schema'
import { leads, briefingResponses, pipelineEvents, emailsSent } from '../database/schema'

@Injectable()
export class LeadsRepository {
  constructor(@Inject(DB) private db: NeonHttpDatabase<typeof schema>) {}

  async findAll(userId: string) {
    const rows = await this.db
      .select()
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.createdAt))

    const withBriefing = await Promise.all(
      rows.map(async (lead) => {
        const [br] = await this.db
          .select()
          .from(briefingResponses)
          .where(eq(briefingResponses.leadId, lead.id))

        const completedSteps: number[] = br
          ? ((br.completedSteps as number[]) ?? [])
          : []
        const progress = Math.round((completedSteps.length / 12) * 100)

        const [lastEvent] = await this.db
          .select()
          .from(pipelineEvents)
          .where(eq(pipelineEvents.leadId, lead.id))
          .orderBy(desc(pipelineEvents.createdAt))
          .limit(1)

        return {
          id: lead.id,
          clientName: lead.clientName,
          clientEmail: lead.clientEmail,
          projectName: lead.projectName,
          pipelineStatus: lead.pipelineStatus,
          pipelineColumn: lead.pipelineColumn,
          estimatedValue: lead.estimatedValue,
          briefingProgress: progress,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          lastActivity: lastEvent?.createdAt ?? lead.updatedAt,
        }
      }),
    )
    return withBriefing
  }

  async findById(id: string, userId: string) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.userId, userId)))

    if (!lead) return null

    const [briefing] = await this.db
      .select()
      .from(briefingResponses)
      .where(eq(briefingResponses.leadId, id))

    const events = await this.db
      .select()
      .from(pipelineEvents)
      .where(eq(pipelineEvents.leadId, id))
      .orderBy(desc(pipelineEvents.createdAt))
      .limit(20)

    return { ...lead, briefingResponses: briefing ?? null, recentEvents: events }
  }

  async findByIdOnly(id: string) {
    const [lead] = await this.db.select().from(leads).where(eq(leads.id, id))
    return lead ?? null
  }

  async create(userId: string, data: Partial<typeof leads.$inferInsert>) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90)

    const [lead] = await this.db
      .insert(leads)
      .values({ ...data, userId, briefingExpiresAt: expiresAt } as typeof leads.$inferInsert)
      .returning()
    return lead
  }

  async update(id: string, userId: string, data: Partial<typeof leads.$inferInsert>) {
    const [lead] = await this.db
      .update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(leads.id, id), eq(leads.userId, userId)))
      .returning()
    return lead
  }

  async updateStatus(id: string, status: string) {
    const [lead] = await this.db
      .update(leads)
      .set({
        pipelineStatus: status as typeof schema.pipelineStatusEnum.enumValues[number],
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning()
    return lead
  }

  async updateKanban(id: string, userId: string, column: number) {
    const [lead] = await this.db
      .update(leads)
      .set({ pipelineColumn: column, updatedAt: new Date() })
      .where(and(eq(leads.id, id), eq(leads.userId, userId)))
      .returning()
    return lead
  }

  async delete(id: string, userId: string) {
    await this.db.delete(leads).where(and(eq(leads.id, id), eq(leads.userId, userId)))
  }

  async createEvent(data: {
    leadId: string
    eventType: string
    fromStatus?: string
    toStatus?: string
    metadata?: Record<string, unknown>
    createdBy?: string
  }) {
    await this.db.insert(pipelineEvents).values(data)
  }

  async getEvents(leadId: string, userId: string) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.userId, userId)))
    if (!lead) return null

    return this.db
      .select()
      .from(pipelineEvents)
      .where(eq(pipelineEvents.leadId, leadId))
      .orderBy(desc(pipelineEvents.createdAt))
  }

  async getEmails(leadId: string, userId: string) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.userId, userId)))
    if (!lead) return null

    return this.db
      .select()
      .from(emailsSent)
      .where(eq(emailsSent.leadId, leadId))
      .orderBy(desc(emailsSent.sentAt))
  }
}
