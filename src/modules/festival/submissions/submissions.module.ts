import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionEntity } from './domains/entities/submission.entity';
import { SubmissionRepository } from './infrastructures/repositories/submission.repository';
import { SUBMISSION_REPOSITORY_TOKEN } from './infrastructures/repositories/submission.repository.interface';
import { SubmissionMapper } from './domains/mappers/submission.mapper';
import { SubmissionDomainService } from './domains/services/submission-domain.service';
import { CreateSubmissionUseCase } from './applications/use-cases/create-submission.use-case';
import { SubmissionsOrchestrator } from './applications/orchestrator/submissions.orchestrator';
import { SubmissionsController } from './interface/http/submissions.controller';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionEntity]),
    RegistrationsModule, // Wajib diimpor karena kita butuh Registration Repository
  ],
  controllers: [SubmissionsController],
  providers: [
    {
      provide: SUBMISSION_REPOSITORY_TOKEN,
      useClass: SubmissionRepository,
    },
    SubmissionMapper,
    SubmissionDomainService,
    CreateSubmissionUseCase,
    SubmissionsOrchestrator,
  ],
  exports: [
    SUBMISSION_REPOSITORY_TOKEN,
    SubmissionMapper,
    SubmissionDomainService,
    CreateSubmissionUseCase,
    SubmissionsOrchestrator,
  ],
})
export class SubmissionsModule {}
