import { Controller, Get, Param, UseGuards, Request, Res } from '@nestjs/common'
import type { Response } from 'express'
import { PdfService } from './pdf.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

interface AuthRequest {
  user: { userId: string; email: string }
}

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private pdfService: PdfService) {}

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generateBriefingPdf(id, req.user.userId)
    const date = new Date().toISOString().split('T')[0]
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="briefing-${date}.pdf"`,
      'Content-Length': buffer.length,
    })
    res.end(buffer)
  }
}
