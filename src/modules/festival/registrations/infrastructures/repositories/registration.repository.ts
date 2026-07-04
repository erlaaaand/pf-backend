import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionRegistrationEntity } from '../../domains/entities/registration.entity';
import type { IRegistrationRepository } from './registration.repository.interface';

@Injectable()
export class RegistrationRepository implements IRegistrationRepository {
  constructor(
    @InjectRepository(CompetitionRegistrationEntity)
    private readonly repo: Repository<CompetitionRegistrationEntity>,
  ) {}

  async save(
    registration: CompetitionRegistrationEntity,
  ): Promise<CompetitionRegistrationEntity> {
    return this.repo.save(registration);
  }

  async findById(id: string): Promise<CompetitionRegistrationEntity | null> {
    return this.repo.findOne({
      where: { id: id },
      relations: {
        competition: true,
        wave: true,
        team: true,
        user: true,
      },
    });
  }

  async findMyRegistrations(
    userId: string,
  ): Promise<CompetitionRegistrationEntity[]> {
    return this.repo
      .createQueryBuilder('reg')
      .leftJoinAndSelect('reg.competition', 'competition')
      .leftJoinAndSelect('reg.wave', 'wave')
      .leftJoinAndSelect('reg.team', 'team')
      .leftJoinAndSelect('reg.user', 'user')
      .leftJoin('team.members', 'members') // Join untuk mengecek keanggotaan
      .where('reg.userId = :userId', { userId }) // Pendaftaran Individu
      .orWhere('team.leaderId = :userId', { userId }) // Pendaftaran Tim (sebagai ketua)
      .orWhere('members.userId = :userId', { userId }) // Pendaftaran Tim (sebagai anggota)
      .getMany();
  }
}
