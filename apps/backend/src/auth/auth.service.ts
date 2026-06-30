import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcrypt'
import { DB } from '../database/database.module'
import { users } from '../database/schema'
import type * as schema from '../database/schema'
import type { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private db: NeonHttpDatabase<typeof schema>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const [user] = await this.db.select().from(users).where(eq(users.email, dto.email))
    if (!user) throw new UnauthorizedException('Credenciais inválidas')

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException('Credenciais inválidas')

    const payload = { sub: user.id, email: user.email }
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    })
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    })

    const hashedRefresh = await bcrypt.hash(refreshToken, 10)
    await this.db.update(users).set({ refreshToken: hashedRefresh }).where(eq(users.id, user.id))

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    }
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(token, {
        secret: this.config.get('JWT_SECRET'),
      })
      const [user] = await this.db.select().from(users).where(eq(users.id, payload.sub))
      if (!user || !user.refreshToken) throw new UnauthorizedException()

      const valid = await bcrypt.compare(token, user.refreshToken)
      if (!valid) throw new UnauthorizedException()

      const newPayload = { sub: user.id, email: user.email }
      return {
        access_token: this.jwtService.sign(newPayload, {
          expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
        }),
      }
    } catch {
      throw new UnauthorizedException('Refresh token inválido')
    }
  }

  async logout(userId: string) {
    await this.db.update(users).set({ refreshToken: null }).where(eq(users.id, userId))
    return { message: 'Logout realizado com sucesso' }
  }

  async me(userId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        logoUrl: users.logoUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
    if (!user) throw new UnauthorizedException()
    return user
  }
}
