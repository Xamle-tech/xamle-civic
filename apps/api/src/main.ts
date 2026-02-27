import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });

  const config = app.get(ConfigService);
  const port = parseInt(config.get('API_PORT', '4000'), 10);

  // ─── Security middleware ─────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", 'wss:'],
      },
    },
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    frameguard: { action: 'sameorigin' },
  }));

  app.use(cookieParser());

  const rawOrigins = config.get<string>('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001');
  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  });

  // ─── Global pipes, interceptors, filters ─────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api/v1', { exclude: ['/health', '/api/docs'] });

  // ─── Swagger / OpenAPI ───────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Xamle Civic API')
    .setDescription(
      'API REST pour la plateforme de transparence et participation citoyenne Xamle Civic — Sénégal',
    )
    .setVersion('1.0')
    .setContact('Xamle Civic', 'https://xamle.sn', 'tech@xamle.sn')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addCookieAuth('refresh_token')
    .addTag('auth', 'Authentification et sessions')
    .addTag('policies', 'Politiques publiques')
    .addTag('ministries', 'Ministères')
    .addTag('contributions', 'Contributions citoyennes')
    .addTag('comments', 'Commentaires')
    .addTag('search', 'Recherche full-text')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('admin', 'Administration')
    .addTag('health', 'Santé système')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
  logger.log(`🚀 API running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
