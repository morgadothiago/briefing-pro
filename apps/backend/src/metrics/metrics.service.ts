import { Injectable, Inject } from '@nestjs/common'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { DB } from '../database/database.module'
import * as schema from '../database/schema'
import { leads } from '../database/schema'

const CLOSED_STATUSES = [
  'CONTRATO_ASSINADO',
  'AGUARDANDO_PAGAMENTO',
  'PAGO_PARCIAL',
  'PAGO_TOTAL',
  'PROJETO_INICIADO',
]

const ACTIVE_STATUSES = [
  'LEAD',
  'CONTATO_FEITO',
  'FORMULARIO_ENVIADO',
  'FORMULARIO_PREENCHIDO',
  'EM_ANALISE',
  'ANALISADO',
  'REUNIAO_AGENDADA',
  'REUNIAO_REALIZADA',
  'ESCOPO_GERADO',
  'ESCOPO_APROVADO',
  'PROPOSTA_ENVIADA',
  'PROPOSTA_ACEITA',
  'CONTRATO_ENVIADO',
]

@Injectable()
export class MetricsService {
  constructor(@Inject(DB) private db: NeonHttpDatabase<typeof schema>) {}

  async getMetrics(userId: string) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const all = await this.db.select().from(leads).where(eq(leads.userId, userId))

    const thisMonth = all.filter(
      (l) => l.createdAt && new Date(l.createdAt) >= startOfMonth,
    )

    const closed = all.filter((l) => CLOSED_STATUSES.includes(l.pipelineStatus))
    const active = all.filter((l) => ACTIVE_STATUSES.includes(l.pipelineStatus))

    const pipelineValue = active.reduce((sum, l) => {
      return sum + (l.estimatedValue ? parseFloat(String(l.estimatedValue)) : 0)
    }, 0)

    const conversionRate =
      all.length > 0 ? Math.round((closed.length / all.length) * 100) : 0

    return {
      leads_this_month: thisMonth.length,
      conversion_rate: conversionRate,
      pipeline_value: pipelineValue,
      contracts_closed: closed.filter((l) => l.pipelineStatus === 'CONTRATO_ASSINADO').length,
    }
  }
}
