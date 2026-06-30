import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { DB } from '../database/database.module'
import * as schema from '../database/schema'
import { emailsSent, users } from '../database/schema'
import { welcomeTemplate } from './templates/welcome.template'
import { briefingReceivedTemplate } from './templates/briefing-received.template'

type Lead = typeof schema.leads.$inferSelect

@Injectable()
export class EmailService {
  private resend: Resend

  constructor(
    private config: ConfigService,
    @Inject(DB) private db: NeonHttpDatabase<typeof schema>,
  ) {
    this.resend = new Resend(config.get<string>('RESEND_API_KEY'))
  }

  async sendWelcomeEmail(lead: Lead): Promise<void> {
    if (!lead.clientEmail) return

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000')
    const link = `${frontendUrl}/briefing/${lead.briefingToken}`

    const [user] = await this.db.select().from(users).where(eq(users.id, lead.userId))
    const adminName = user?.name ?? 'Nossa equipe'

    const { subject, html } = welcomeTemplate({
      clientName: lead.clientName,
      projectName: lead.projectName,
      briefingLink: link,
      adminName,
    })

    await this.send({
      leadId: lead.id,
      template: 'welcome',
      to: lead.clientEmail,
      subject,
      html,
    })
  }

  async sendBriefingReceivedEmail(lead: Lead): Promise<void> {
    const now = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const [user] = await this.db.select().from(users).where(eq(users.id, lead.userId))
    const adminEmail = user?.email ?? this.config.get<string>('ADMIN_EMAIL', '')

    // Email to admin
    if (adminEmail) {
      const { subject, html } = briefingReceivedTemplate({
        clientName: lead.clientName,
        projectName: lead.projectName,
        submittedAt: now,
        isAdmin: true,
      })
      await this.send({
        leadId: lead.id,
        template: 'briefing-received-admin',
        to: adminEmail,
        subject,
        html,
      })
    }

    // Email to client
    if (lead.clientEmail) {
      const { subject, html } = briefingReceivedTemplate({
        clientName: lead.clientName,
        projectName: lead.projectName,
        submittedAt: now,
        isAdmin: false,
      })
      await this.send({
        leadId: lead.id,
        template: 'briefing-received-client',
        to: lead.clientEmail,
        subject,
        html,
      })
    }
  }

  private async send(params: {
    leadId: string
    template: string
    to: string
    subject: string
    html: string
  }): Promise<void> {
    const [record] = await this.db
      .insert(emailsSent)
      .values({
        leadId: params.leadId,
        template: params.template,
        toEmail: params.to,
        subject: params.subject,
        status: 'queued',
      })
      .returning()

    try {
      const from = this.config.get<string>('EMAIL_FROM', 'BriefingPro <onboarding@resend.dev>')
      const result = await this.resend.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      })

      await this.db
        .update(emailsSent)
        .set({
          resendId: result.data?.id ?? null,
          status: 'sent',
          sentAt: new Date(),
        })
        .where(eq(emailsSent.id, record.id))
    } catch (err) {
      console.error('Email send error:', err)
      await this.db
        .update(emailsSent)
        .set({ status: 'failed' })
        .where(eq(emailsSent.id, record.id))
    }
  }
}
