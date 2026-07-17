// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ThrottlerModule,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Import Validasi Environment
import { validate } from './modules/shared/config/env.validation';

// Import Modul Fitur
import { LoggerMiddleware } from './modules/system/logger/logger.middleware';
import { AuthModule } from './modules/identity/auth/auth.module';
import { UserModule } from './modules/identity/users/user.module';
import { StorageModule } from './modules/shared/storage/storage.module';
import { MailModule } from './modules/shared/mail/mail.module';
import { CompetitionsModule } from './modules/festival/competitions/competitions.module';
import { TeamsModule } from './modules/festival/teams/teams.module';
import { RegistrationsModule } from './modules/festival/registrations/registrations.module';
import { SubmissionsModule } from './modules/festival/submissions/submissions.module';
import { NotificationsModule } from './modules/shared/notifications/notifications.module';
import { AuditLogModule } from './modules/system/audit-log/audit-log.module';
import { QueueModule } from './modules/system/queue/queue.module';
import { SearchModule } from './modules/system/search/search.module';
import { WorkersModule } from './modules/system/workers/workers.module';
import { SimulationModule } from './modules/system/simulation/simulation.module';
import { HealthModule } from './modules/system/health/health.module';

@Module({
  imports: [
    // 1. Konfigurasi Environment (Global)
    ConfigModule.forRoot({
      isGlobal: true,
      validate, // Menggunakan env.validation.ts yang sudah kita buat
      envFilePath: '.env.development.local', // Bisa diganti sesuai environment
    }),

    // 2. Konfigurasi Database (TypeORM - MySQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          autoLoadEntities: true, // Otomatis memuat entitas yang terdaftar di forFeature()
          // Matikan synchronize di production untuk mencegah hilangnya data!
          synchronize: !isProduction,
          extra: {
            connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT'),
          },
        };
      },
    }),

    // 2b. Konfigurasi Database (Mongoose - MongoDB)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    // 3. Konfigurasi Redis Caching (Global)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          ttl: 60 * 1000, // 1 menit default
        });
        return { store: store };
      },
    }),

    // 4. Konfigurasi Rate Limiting (Throttler / Anti-Spam) dengan Redis
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);

        return {
          // Menggunakan Redis sebagai storage limiter untuk mendukung multi-instance
          storage: new ThrottlerStorageRedisService(
            `redis://${redisHost}:${redisPort}`,
          ),
          throttlers: [
            {
              name: 'default',
              ttl: configService.get<number>('THROTTLE_TTL_DEFAULT', 60000),
              limit: configService.get<number>('THROTTLE_LIMIT_DEFAULT', 100),
            },
            {
              name: 'strict',
              ttl: configService.get<number>('THROTTLE_TTL_STRICT', 60000),
              limit: configService.get<number>('THROTTLE_LIMIT_STRICT', 10),
            },
          ],
        };
      },
    }),

    // 4. Konfigurasi Event Emitter (Global)
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // 5. Daftarkan Modul Fitur Aplikasi
    AuthModule,
    UserModule,
    StorageModule,
    MailModule,
    CompetitionsModule,
    TeamsModule,
    RegistrationsModule,
    SubmissionsModule,
    NotificationsModule,
    AuditLogModule,
    QueueModule,
    SearchModule,
    WorkersModule,
    HealthModule,
    SimulationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
