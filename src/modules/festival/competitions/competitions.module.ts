import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entitas
import { CompetitionEntity } from './domains/entities/competition.entity';
import { CompetitionWaveEntity } from './domains/entities/competition-wave.entity';

// Repositori
import { COMPETITION_REPOSITORY_TOKEN } from './infrastructures/repositories/competition.repository.interface';
import { CompetitionRepository } from './infrastructures/repositories/competition.repository';

// Domain Mappers
import { CompetitionMapper } from './domains/mappers/competition.mapper';

// Use Cases
import { GetAllCompetitionsUseCase } from './applications/use-cases/get-all-competitions.use-case';
import { GetCompetitionDetailUseCase } from './applications/use-cases/get-competition-detail.use-case';

// Orchestrator & Controller
import { CompetitionsOrchestrator } from './applications/orchestrator/competitions.orchestrator';
import { CompetitionsController } from './interface/http/competitions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompetitionEntity, CompetitionWaveEntity]),
    CacheModule.register(),
  ],
  controllers: [CompetitionsController],
  providers: [
    // Repositori
    {
      provide: COMPETITION_REPOSITORY_TOKEN,
      useClass: CompetitionRepository,
    },
    // Domain Mappers
    CompetitionMapper,
    // Use Cases
    GetAllCompetitionsUseCase,
    GetCompetitionDetailUseCase,
    // Orchestrators
    CompetitionsOrchestrator,
  ],
  exports: [COMPETITION_REPOSITORY_TOKEN],
})
export class CompetitionsModule {}
