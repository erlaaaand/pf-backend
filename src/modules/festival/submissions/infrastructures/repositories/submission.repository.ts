import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionEntity } from '../../domains/entities/submission.entity';
import type { ISubmissionRepository } from './submission.repository.interface';

@Injectable()
export class SubmissionRepository implements ISubmissionRepository {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly repo: Repository<SubmissionEntity>,
  ) {}

  async save(submission: SubmissionEntity): Promise<SubmissionEntity> {
    return this.repo.save(submission);
  }

  async findById(id: string): Promise<SubmissionEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { registration: true },
    });
  }

  async findByRegistrationId(
    registrationId: string,
  ): Promise<SubmissionEntity | null> {
    return this.repo.findOne({
      where: { registrationId },
      relations: { registration: true },
    });
  }
}
