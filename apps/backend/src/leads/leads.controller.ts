import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common'
import { LeadsService } from './leads.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateLeadDto, UpdateLeadDto, UpdateStatusDto, UpdateKanbanDto } from './dto/create-lead.dto'

interface AuthRequest {
  user: { userId: string; email: string }
}

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.leadsService.findAll(req.user.userId)
  }

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(req.user.userId, dto)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.leadsService.findById(id, req.user.userId)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, req.user.userId, dto)
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.leadsService.updateStatus(id, req.user.userId, dto)
  }

  @Patch(':id/kanban')
  updateKanban(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateKanbanDto,
  ) {
    return this.leadsService.updateKanban(id, req.user.userId, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.leadsService.delete(id, req.user.userId)
  }

  @Get(':id/events')
  getEvents(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.leadsService.getEvents(id, req.user.userId)
  }

  @Get(':id/emails')
  getEmails(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.leadsService.getEmails(id, req.user.userId)
  }
}
