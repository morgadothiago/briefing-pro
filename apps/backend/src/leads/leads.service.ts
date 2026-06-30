import { Injectable, NotFoundException } from '@nestjs/common'
import { LeadsRepository } from './leads.repository'
import { EmailService } from '../email/email.service'
import { CreateLeadDto, UpdateLeadDto, UpdateStatusDto, UpdateKanbanDto } from './dto/create-lead.dto'

@Injectable()
export class LeadsService {
  constructor(
    private leadsRepo: LeadsRepository,
    private emailService: EmailService,
  ) {}

  async findAll(userId: string) {
    const data = await this.leadsRepo.findAll(userId)
    return { data, total: data.length }
  }

  async findById(id: string, userId: string) {
    const lead = await this.leadsRepo.findById(id, userId)
    if (!lead) throw new NotFoundException('Lead não encontrado')
    return lead
  }

  async create(userId: string, dto: CreateLeadDto) {
    const lead = await this.leadsRepo.create(userId, {
      clientName: dto.clientName,
      clientEmail: dto.clientEmail,
      clientPhone: dto.clientPhone,
      clientCompany: dto.clientCompany,
      projectName: dto.projectName,
      projectType: dto.projectType,
      estimatedValue: dto.estimatedValue?.toString(),
    })
    if (lead && dto.clientEmail) {
      this.emailService.sendWelcomeEmail(lead).catch(console.error)
    }
    return lead
  }

  async update(id: string, userId: string, dto: UpdateLeadDto) {
    const existing = await this.leadsRepo.findById(id, userId)
    if (!existing) throw new NotFoundException('Lead não encontrado')

    return this.leadsRepo.update(id, userId, {
      clientName: dto.clientName,
      clientEmail: dto.clientEmail,
      clientPhone: dto.clientPhone,
      clientCompany: dto.clientCompany,
      projectName: dto.projectName,
      estimatedValue: dto.estimatedValue?.toString(),
      notes: dto.notes,
      meetingDate: dto.meetingDate ? new Date(dto.meetingDate) : undefined,
      meetingLink: dto.meetingLink,
      meetingNotes: dto.meetingNotes,
    })
  }

  async updateStatus(id: string, userId: string, dto: UpdateStatusDto) {
    const lead = await this.leadsRepo.findById(id, userId)
    if (!lead) throw new NotFoundException('Lead não encontrado')

    const fromStatus = lead.status
    await this.leadsRepo.updateStatus(id, dto.status)

    await this.leadsRepo.createEvent({
      leadId: id,
      eventType: 'status_changed',
      fromStatus: fromStatus ?? undefined,
      toStatus: dto.status,
      createdBy: 'admin',
    })

    if (dto.status === 'CONTATO_FEITO' && lead.email) {
      const updatedLead = await this.leadsRepo.findByIdOnly(id)
      if (updatedLead) {
        this.emailService.sendWelcomeEmail(updatedLead).catch(console.error)
      }
    }

    return this.leadsRepo.findById(id, userId)
  }

  async updateKanban(id: string, userId: string, dto: UpdateKanbanDto) {
    const existing = await this.leadsRepo.findById(id, userId)
    if (!existing) throw new NotFoundException('Lead não encontrado')
    return this.leadsRepo.updateKanban(id, userId, dto.column)
  }

  async delete(id: string, userId: string) {
    const existing = await this.leadsRepo.findById(id, userId)
    if (!existing) throw new NotFoundException('Lead não encontrado')
    await this.leadsRepo.delete(id, userId)
    return { message: 'Lead removido com sucesso' }
  }

  async getEvents(leadId: string, userId: string) {
    const events = await this.leadsRepo.getEvents(leadId, userId)
    if (!events) throw new NotFoundException('Lead não encontrado')
    return events
  }

  async getEmails(leadId: string, userId: string) {
    const emails = await this.leadsRepo.getEmails(leadId, userId)
    if (!emails) throw new NotFoundException('Lead não encontrado')
    return emails
  }

  async getBriefing(leadId: string, userId: string) {
    const briefing = await this.leadsRepo.getBriefing(leadId, userId)
    if (briefing === null && !(await this.leadsRepo.findById(leadId, userId))) {
      throw new NotFoundException('Lead não encontrado')
    }
    return briefing
  }

  async getNotes(leadId: string, userId: string) {
    const notes = await this.leadsRepo.getNotes(leadId, userId)
    if (notes === null) throw new NotFoundException('Lead não encontrado')
    return notes
  }

  async addNote(leadId: string, userId: string, content: string) {
    const result = await this.leadsRepo.addNote(leadId, userId, content)
    if (!result) throw new NotFoundException('Lead não encontrado')
    return result
  }
}
