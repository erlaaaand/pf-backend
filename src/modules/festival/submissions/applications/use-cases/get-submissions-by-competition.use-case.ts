import { Inject, Injectable } from '@nestjs/common';
import {
  type ISubmissionRepository,
  SUBMISSION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/submission.repository.interface';
import { SubmissionMapper } from '../../domains/mappers/submission.mapper';
import { SubmissionResponseDto } from '../dto/submission-response.dto';

@Injectable()
export class GetSubmissionsByCompetitionUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubmissionRepository,
    private readonly mapper: SubmissionMapper,
  ) {}

  async execute(competitionId: string): Promise<SubmissionResponseDto[]> {
    const submissions = await this.subRepo.findByCompetitionId(competitionId);
    return submissions.map((sub) => this.mapper.toResponseDto(sub));
  }
}
