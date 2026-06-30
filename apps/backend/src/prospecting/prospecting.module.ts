import { Module } from '@nestjs/common'
import { ProspectingService } from './prospecting.service'
import { ProspectingController } from './prospecting.controller'

@Module({
  controllers: [ProspectingController],
  providers: [ProspectingService],
})
export class ProspectingModule {}
