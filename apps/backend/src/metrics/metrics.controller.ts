import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { MetricsService } from './metrics.service'

interface AuthRequest {
  user: { userId: string; email: string }
}

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  getMetrics(@Request() req: AuthRequest) {
    return this.metricsService.getMetrics(req.user.userId)
  }
}
