import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
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

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`BriefingPro API running on http://localhost:${port}/api`)
}

bootstrap()
