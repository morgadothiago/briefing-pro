import {
  Controller, Post, Get, Param, UseInterceptors,
  UploadedFile, BadRequestException, Res, Inject,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { createReadStream, existsSync } from 'fs'
import type { Response } from 'express'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { DB } from '../database/database.module'
import * as schema from '../database/schema'
import { uploadedFiles, leads } from '../database/schema'

const UPLOADS_DIR = join(process.cwd(), '..', '..', 'uploads')

@Controller()
export class FilesController {
  constructor(@Inject(DB) private db: NeonHttpDatabase<typeof schema>) {}

  @Post('briefing/:token/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_, file, cb) => {
          const unique = `${uuidv4()}${extname(file.originalname)}`
          cb(null, unique)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
        if (allowed.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new BadRequestException('Tipo de arquivo não permitido'), false)
        }
      },
    }),
  )
  async uploadFile(
    @Param('token') token: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const [lead] = await this.db.select().from(leads).where(eq(leads.briefingToken, token))
    if (!lead) throw new BadRequestException('Token inválido')

    const url = `/uploads/${file.filename}`
    await this.db.insert(uploadedFiles).values({
      leadId: lead.id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url,
    })

    return { url, original_name: file.originalname, size_bytes: file.size }
  }

  @Get('uploads/:filename')
  async streamFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(UPLOADS_DIR, filename)
    if (!existsSync(filePath)) {
      res.status(404).json({ message: 'Arquivo não encontrado' })
      return
    }
    const stream = createReadStream(filePath)
    stream.pipe(res)
  }
}
