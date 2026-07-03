import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionEntity } from '../../domains/entities/competition.entity';
import { ICompetitionRepository } from './competition.repository.interface';

@Injectable()
export class CompetitionRepository implements ICompetitionRepository {
  constructor(
    @InjectRepository(CompetitionEntity)
    private readonly ormRepo: Repository<CompetitionEntity>,
  ) {}

  async findAll(): Promise<CompetitionEntity[]> {
    return this.ormRepo.find({
      relations: {
        waves: true,
      },
      order: { name: 'ASC' }, // Urutkan berdasarkan abjad
    });
  }

  async findById(id: string): Promise<CompetitionEntity | null> {
    return this.ormRepo.findOne({
      where: { id },
      relations: {
        waves: true,
      },
    });
  }
}
