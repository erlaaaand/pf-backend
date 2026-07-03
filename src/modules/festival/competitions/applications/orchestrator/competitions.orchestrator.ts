import { Injectable } from '@nestjs/common';
import { GetAllCompetitionsUseCase } from '../use-cases/get-all-competitions.use-case';
import { GetCompetitionDetailUseCase } from '../use-cases/get-competition-detail.use-case';
import { CompetitionResponseDto } from '../dto/competition-response.dto';

@Injectable()
export class CompetitionsOrchestrator {
  constructor(
    private readonly getAllUseCase: GetAllCompetitionsUseCase,
    private readonly getDetailUseCase: GetCompetitionDetailUseCase,
  ) {}

  async getAll(): Promise<CompetitionResponseDto[]> {
    return this.getAllUseCase.execute();
  }

  async getDetail(id: string): Promise<CompetitionResponseDto> {
    return this.getDetailUseCase.execute(id);
  }
}
