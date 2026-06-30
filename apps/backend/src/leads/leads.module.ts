import { Module } from '@nestjs/common'
import { LeadsController } from './leads.controller'
import { LeadsService } from './leads.service'
import { LeadsRepository } from './leads.repository'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [EmailModule],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsRepository],
  exports: [LeadsService, LeadsRepository],
})
export class LeadsModule {}
