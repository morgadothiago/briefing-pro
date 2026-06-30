import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true })
  app.use(require('express').json({ limit: '10mb' }))
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }))

  app.setGlobalPrefix('api')

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://briefingpro-frontend.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BriefingPro API')
    .setDescription('API do sistema BriefingPro')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`BriefingPro API running on http://localhost:${port}/api`)
  console.log(`Swagger docs: http://localhost:${port}/api/docs`)
}

bootstrap()
