import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { LeadsModule } from './leads/leads.module'
import { BriefingModule } from './briefing/briefing.module'
import { FilesModule } from './files/files.module'
import { EmailModule } from './email/email.module'
import { PdfModule } from './pdf/pdf.module'
import { MetricsModule } from './metrics/metrics.module'
import { ProspectingModule } from './prospecting/prospecting.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    LeadsModule,
    BriefingModule,
    FilesModule,
    EmailModule,
    PdfModule,
    MetricsModule,
    ProspectingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
