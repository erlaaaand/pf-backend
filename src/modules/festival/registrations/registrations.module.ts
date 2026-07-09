// src/festival/registrations/registrations.module.ts
import { Module } from '@nestjs/common';
import { StorageModule } from '../../shared/storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { CompetitionRegistrationEntity } from './domains/entities/registration.entity';

// Repositories
import { RegistrationRepository } from './infrastructures/repositories/registration.repository';
import { REGISTRATION_REPOSITORY_TOKEN } from './infrastructures/repositories/registration.repository.interface';

// Domains & Mappers
import { RegistrationMapper } from './domains/mappers/registration.mapper';
import { RegistrationDomainService } from './domains/services/registration-domain.service';

// Use Cases
import { RegisterCompetitionUseCase } from './applications/use-cases/register-competition.use-case';
import { GetMyRegistrationsUseCase } from './applications/use-cases/get-my-registrations.use-case';
import { GetCompetitionRegistrationsUseCase } from './applications/use-cases/get-competition-registrations.use-case';
import { SetChampionUseCase } from './applications/use-cases/set-champion.use-case';
import { UploadPaymentProofUseCase } from './applications/use-cases/upload-payment-proof.use-case';
import { VerifyPaymentUseCase } from './applications/use-cases/verify-payment.use-case';
import { GetPendingVerificationsUseCase } from './applications/use-cases/get-pending-verifications.use-case';

// Orchestrator & Controller
import { RegistrationsOrchestrator } from './applications/orchestrator/registrations.orchestrator';
import { RegistrationsController } from './interface/http/registrations.controller';

// Cross-Module Imports
import { UserModule } from '../../identity/users/user.module';
import { TeamsModule } from '../teams/teams.module';
import { CompetitionsModule } from '../competitions/competitions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompetitionRegistrationEntity]),
    UserModule,
    TeamsModule,
    CompetitionsModule,
    StorageModule,
  ],
  controllers: [RegistrationsController],
  providers: [
    {
      provide: REGISTRATION_REPOSITORY_TOKEN,
      useClass: RegistrationRepository,
    },
    RegistrationMapper,
    RegistrationDomainService,
    RegisterCompetitionUseCase,
    GetMyRegistrationsUseCase,
    GetCompetitionRegistrationsUseCase,
    SetChampionUseCase,
    UploadPaymentProofUseCase,
    VerifyPaymentUseCase,
    GetPendingVerificationsUseCase,
    RegistrationsOrchestrator,
  ],
  exports: ['REGISTRATION_REPOSITORY_TOKEN'],
})
export class RegistrationsModule {}
