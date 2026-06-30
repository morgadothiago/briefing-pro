import { Controller, Get, Patch, Post, Param, Body, ParseIntPipe } from '@nestjs/common'
import { BriefingService } from './briefing.service'

@Controller('briefing')
export class BriefingController {
  constructor(private briefingService: BriefingService) {}

  @Get(':token')
  get(@Param('token') token: string) {
    return this.briefingService.get(token)
  }

  @Patch(':token/step/:step')
  saveStep(
    @Param('token') token: string,
    @Param('step', ParseIntPipe) step: number,
    @Body() body: Record<string, unknown>,
  ) {
    const data = ('data' in body) ? body['data'] : body
    return this.briefingService.saveStep(token, step, data)
  }

  @Post(':token/submit')
  submit(
    @Param('token') token: string,
    @Body() body: { signature?: { type: string; value: string } },
  ) {
    return this.briefingService.submit(token, body?.signature)
  }
}
