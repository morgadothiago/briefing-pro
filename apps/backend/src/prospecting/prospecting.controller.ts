import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, HttpCode } from '@nestjs/common'
import { ProspectingService } from './prospecting.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

interface AuthRequest {
  user: { userId: string; email: string }
}

@Controller('prospecting')
@UseGuards(JwtAuthGuard)
export class ProspectingController {
  constructor(private service: ProspectingService) {}

  @Get('keywords')
  getKeywords(@Request() req: AuthRequest) {
    return this.service.getKeywords(req.user.userId)
  }

  @Post('keywords')
  addKeyword(@Request() req: AuthRequest, @Body() body: { keyword: string }) {
    return this.service.addKeyword(req.user.userId, body.keyword)
  }

  @Delete('keywords/:id')
  removeKeyword(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.service.removeKeyword(req.user.userId, id)
  }

  @Post('search')
  @HttpCode(200)
  search(@Request() req: AuthRequest) {
    return this.service.search(req.user.userId)
  }
}
