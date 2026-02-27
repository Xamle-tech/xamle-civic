import {
  Controller, Post, Body, Req, Res, HttpCode, HttpStatus, Get, UseGuards, SetMetadata,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, OtpVerifyDto } from '@xamle/types';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Public()
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Inscription nouvel utilisateur' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken, expiresIn: result.expiresIn };
  }

  @Post('login')
  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    // Normalize email (trim + lowercase) before processing
    const normalizedDto = { ...dto, email: dto.email.trim().toLowerCase() };
    const result = await this.auth.login(normalizedDto);
    this.setRefreshCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken, expiresIn: result.expiresIn };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renouveler les tokens' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req as unknown as { user: { sub: string } }).user?.sub;
    const refreshToken = req.cookies?.['refresh_token'];
    const tokens = await this.auth.refreshTokens(userId, refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Déconnexion' })
  async logout(@CurrentUser('sub') userId: string, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(userId);
    res.clearCookie('refresh_token');
    return { message: 'Déconnecté avec succès' };
  }

  @Post('otp/send')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer OTP par SMS' })
  sendOtp(@Body('phone') phone: string) {
    return this.auth.sendOtp(phone);
  }

  @Post('otp/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier OTP' })
  async verifyOtp(@Body() dto: OtpVerifyDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.verifyOtp(dto.phone, dto.code);
    this.setRefreshCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'OAuth2 Google — redirect' })
  googleAuth() { /* handled by passport */ }

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'OAuth2 Google — callback' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.auth.handleOAuthUser((req as unknown as { user: { id: string; email: string; name: string; provider: string; avatarUrl?: string } }).user);
    this.setRefreshCookie(res, result.refreshToken);
    res.redirect(`${process.env.APP_URL}/auth/callback?token=${result.accessToken}`);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    });
  }
}
