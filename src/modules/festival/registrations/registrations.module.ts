// src/festival/registrations/registrations.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { CompetitionRegistrationEntity } from './domains/entities/registration.entity';
import { PaymentEntity } from './domains/entities/payment.entity';
import { PaymentAccountEntity } from './domains/entities/payment-account.entity';

// Repositories
import { RegistrationRepository } from './infrastructures/repositories/registration.repository';
import { REGISTRATION_REPOSITORY_TOKEN } from './infrastructures/repositories/registration.repository.interface';
import { PaymentRepository } from './infrastructures/repositories/payment.repository';
import { PAYMENT_REPOSITORY_TOKEN } from './infrastructures/repositories/payment.repository.interface';

// Domains & Mappers
import { RegistrationMapper } from './domains/mappers/registration.mapper';
import { RegistrationDomainService } from './domains/services/registration-domain.service';

// Use Cases
import { RegisterCompetitionUseCase } from './applications/use-cases/register-competition.use-case';
import { GetMyRegistrationsUseCase } from './applications/use-cases/get-my-registrations.use-case';
import { UploadPaymentProofUseCase } from './applications/use-cases/upload-payment-proof.use-case';
import { VerifyPaymentUseCase } from './applications/use-cases/verify-payment.use-case';

// Orchestrator & Controller
import { RegistrationsOrchestrator } from './applications/orchestrator/registrations.orchestrator';
import { RegistrationsController } from './interface/http/registrations.controller';

// Cross-Module Imports
import { UserModule } from '../../identity/users/user.module';
import { TeamsModule } from '../teams/teams.module';
import { CompetitionsModule } from '../competitions/competitions.module'; // AKTIF

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompetitionRegistrationEntity,
      PaymentEntity,
      PaymentAccountEntity,
    ]),
    UserModule,
    TeamsModule,
    CompetitionsModule, // Di-inject agar use-case bisa membaca data lomba & gelombang
  ],
  controllers: [RegistrationsController],
  providers: [
    {
      provide: REGISTRATION_REPOSITORY_TOKEN,
      useClass: RegistrationRepository,
    },
    {
      provide: PAYMENT_REPOSITORY_TOKEN,
      useClass: PaymentRepository,
    },
    RegistrationMapper,
    RegistrationDomainService,
    RegisterCompetitionUseCase,
    GetMyRegistrationsUseCase,
    UploadPaymentProofUseCase,
    VerifyPaymentUseCase,
    RegistrationsOrchestrator,
  ],
  exports: ['REGISTRATION_REPOSITORY_TOKEN'],
})
export class RegistrationsModule {}
