import {
  Injectable, NotFoundException, GoneException, BadRequestException, Inject,
} from '@nestjs/common'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { DB } from '../database/database.module'
import * as schema from '../database/schema'
import { leads, briefingResponses, pipelineEvents } from '../database/schema'
import { EmailService } from '../email/email.service'

@Injectable()
export class BriefingService {
  constructor(
    @Inject(DB) private db: NeonHttpDatabase<typeof schema>,
    private emailService: EmailService,
  ) {}

  private async getLead(token: string) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(eq(leads.briefingToken, token))

    if (!lead) throw new NotFoundException('Formulário não encontrado')
    if (lead.briefingExpiresAt && new Date() > lead.briefingExpiresAt) {
      throw new GoneException('Formulário expirado')
    }
    return lead
  }

  async get(token: string) {
    const lead = await this.getLead(token)
    const [responses] = await this.db
      .select()
      .from(briefingResponses)
      .where(eq(briefingResponses.leadId, lead.id))

    const data = responses
      ? {
          step1: responses.step1 ?? undefined,
          step2: responses.step2 ?? undefined,
          step3: responses.step3 ?? undefined,
          step4: responses.step4 ?? undefined,
          step5: responses.step5 ?? undefined,
          step6: responses.step6 ?? undefined,
          step7: responses.step7 ?? undefined,
          step8: responses.step8 ?? undefined,
          step9: responses.step9 ?? undefined,
          step10: responses.step10 ?? undefined,
          step11: responses.step11 ?? undefined,
          step12: responses.step12 ?? undefined,
        }
      : {}

    return {
      token: lead.briefingToken,
      lead: {
        id: lead.id,
        clientName: lead.clientName,
        projectName: lead.projectName,
        projectType: lead.projectType,
        pipelineStatus: lead.pipelineStatus,
      },
      data,
      currentStep: responses?.currentStep ?? 0,
      completedSteps: (responses?.completedSteps as number[]) ?? [],
      submittedAt: responses?.submittedAt ?? null,
    }
  }

  async saveStep(token: string, step: number, data: unknown) {
    const lead = await this.getLead(token)

    const [existing] = await this.db
      .select()
      .from(briefingResponses)
      .where(eq(briefingResponses.leadId, lead.id))

    const stepKey = `step${step}` as keyof typeof briefingResponses.$inferInsert
    const completed: number[] = (existing?.completedSteps as number[]) ?? []
    if (!completed.includes(step)) completed.push(step)

    const now = new Date()

    if (existing) {
      await this.db
        .update(briefingResponses)
        .set({
          [stepKey]: data,
          completedSteps: completed,
          currentStep: step,
          savedAt: now,
        })
        .where(eq(briefingResponses.leadId, lead.id))
    } else {
      await this.db.insert(briefingResponses).values({
        leadId: lead.id,
        [stepKey]: data,
        completedSteps: completed,
        currentStep: step,
        savedAt: now,
      } as typeof briefingResponses.$inferInsert)
    }

    // Advance status on first save
    if (lead.pipelineStatus === 'CONTATO_FEITO' || lead.pipelineStatus === 'LEAD') {
      await this.db
        .update(leads)
        .set({ pipelineStatus: 'FORMULARIO_ENVIADO', updatedAt: now })
        .where(eq(leads.id, lead.id))

      await this.db.insert(pipelineEvents).values({
        leadId: lead.id,
        eventType: 'status_changed',
        fromStatus: lead.pipelineStatus,
        toStatus: 'FORMULARIO_ENVIADO',
        createdBy: 'client',
      })
    }

    return { saved_at: now }
  }

  async submit(token: string, signature?: { type: string; value: string }) {
    const lead = await this.getLead(token)

    const [existing] = await this.db
      .select()
      .from(briefingResponses)
      .where(eq(briefingResponses.leadId, lead.id))

    if (!existing) throw new BadRequestException('Preencha ao menos uma etapa antes de enviar')

    const now = new Date()

    await this.db
      .update(briefingResponses)
      .set({
        ...(signature ? { signature: { ...signature, timestamp: now.toISOString() } } : {}),
        submittedAt: now,
      })
      .where(eq(briefingResponses.leadId, lead.id))

    await this.db
      .update(leads)
      .set({ pipelineStatus: 'FORMULARIO_PREENCHIDO', updatedAt: now })
      .where(eq(leads.id, lead.id))

    await this.db.insert(pipelineEvents).values({
      leadId: lead.id,
      eventType: 'status_changed',
      fromStatus: lead.pipelineStatus,
      toStatus: 'FORMULARIO_PREENCHIDO',
      createdBy: 'client',
    })

    const [updatedLead] = await this.db.select().from(leads).where(eq(leads.id, lead.id))
    if (updatedLead) {
      this.emailService.sendBriefingReceivedEmail(updatedLead).catch(console.error)
    }

    return { submitted_at: now }
  }
}
