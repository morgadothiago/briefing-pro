import { Controller, Post, Patch, Body, Get, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto, RefreshDto } from './dto/login.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

interface AuthRequest {
  user: { userId: string; email: string }
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: AuthRequest) {
    return this.authService.logout(req.user.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: AuthRequest) {
    return this.authService.me(req.user.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @Request() req: AuthRequest,
    @Body() body: { name?: string; logoUrl?: string; whatsappNumber?: string },
  ) {
    return this.authService.updateProfile(req.user.userId, body)
  }
}
