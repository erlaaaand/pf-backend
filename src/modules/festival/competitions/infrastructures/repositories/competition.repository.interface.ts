import { CompetitionEntity } from '../../domains/entities/competition.entity';
export interface ICompetitionRepository {
  findAll(): Promise<CompetitionEntity[]>;
  findById(id: string): Promise<CompetitionEntity | null>;
  save(competition: CompetitionEntity): Promise<CompetitionEntity>;
}

export const COMPETITION_REPOSITORY_TOKEN = Symbol('ICompetitionRepository');
