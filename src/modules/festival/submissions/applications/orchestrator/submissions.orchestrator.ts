import { Injectable } from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { SubmissionResponseDto } from '../dto/submission-response.dto';
import { CreateSubmissionUseCase } from '../use-cases/create-submission.use-case';

@Injectable()
export class SubmissionsOrchestrator {
  constructor(private readonly createUc: CreateSubmissionUseCase) {}

  async createSubmission(
    userId: string,
    dto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    return this.createUc.execute(userId, dto);
  }
}
