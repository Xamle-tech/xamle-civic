import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../config/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import type Redis from 'ioredis';
import { RegisterDto, LoginDto } from '@xamle/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Cet email est déjà utilisé');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        passwordHash,
        consentGiven: dto.consent,
        consentAt: new Date(),
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`New user registered: ${user.email}`);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Email ou mot de passe incorrect');
    if (!user.isActive) throw new UnauthorizedException('Compte désactivé');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const stored = await this.redis.get(`refresh:${userId}`);
    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('Utilisateur introuvable');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async handleOAuthUser(profile: { id: string; email: string; name: string; provider: string; avatarUrl?: string }) {
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ oauthId: profile.id, oauthProvider: profile.provider }, { email: profile.email }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          oauthProvider: profile.provider,
          oauthId: profile.id,
          avatarUrl: profile.avatarUrl,
          isVerified: true,
          consentGiven: true,
          consentAt: new Date(),
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async sendOtp(phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.setex(`otp:${phone}`, 300, code);
    this.logger.log(`OTP for ${phone}: ${code}`);
    return { message: 'Code OTP envoyé' };
  }

  async verifyOtp(phone: string, code: string) {
    const stored = await this.redis.get(`otp:${phone}`);
    if (!stored || stored !== code) throw new BadRequestException('Code OTP invalide ou expiré');

    await this.redis.del(`otp:${phone}`);
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');

    await this.prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
      }),
    ]);
    return { accessToken, refreshToken, expiresIn: 900 };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const ttl = 7 * 24 * 60 * 60;
    await this.redis.setex(`refresh:${userId}`, ttl, token);
  }

  private sanitizeUser(user: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
