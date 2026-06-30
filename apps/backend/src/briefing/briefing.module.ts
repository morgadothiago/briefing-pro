import { Module } from '@nestjs/common'
import { BriefingController } from './briefing.controller'
import { BriefingService } from './briefing.service'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [EmailModule],
  controllers: [BriefingController],
  providers: [BriefingService],
})
export class BriefingModule {}
