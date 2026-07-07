// src/main.ts
import dns from 'node:dns';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Ambil ConfigService untuk membaca .env
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', '');

  // 1. Setup Keamanan (Helmet)
  app.use(helmet());

  // 2. Setup CORS
  const originsArray = allowedOrigins
    .split(',')
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);

  app.enableCors({
    origin: originsArray.length > 0 ? originsArray : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Setup Global Prefix & Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 4. Setup Global Validation Pipe (Sangat Penting untuk DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5. Setup Swagger API Documentation (Hanya aktif jika BUKAN production)
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Physics Festival 2026 API')
      .setDescription(
        'Dokumentasi lengkap API untuk pendaftaran dan sistem utama Physics Festival 2026',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Masukkan token JWT (Access Token) Anda di sini',
          in: 'header',
        },
        'JWT', // Nama security definition
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    // Endpoint Swagger tersedia di: /api/docs
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Token tidak hilang saat web direfresh
      },
    });
  }

  // 6. Jalankan Server
  await app.listen(port);

  logger.log(`🚀 Aplikasi berjalan di mode: ${nodeEnv.toUpperCase()}`);
  logger.log(`🚀 Server berjalan di: http://localhost:${port}/api/v1`);

  if (nodeEnv !== 'production') {
    logger.log(
      `📚 Dokumentasi Swagger tersedia di: http://localhost:${port}/api/docs`,
    );
  }
}

// Menangkap unhandled rejections agar aplikasi tidak crash secara diam-diam
process.on('unhandledRejection', (reason: unknown) => {
  const logger = new Logger('UnhandledRejection');
  logger.error(
    'Unhandled Promise Rejection',
    reason instanceof Error ? reason.stack : reason,
  );
});

void bootstrap();
