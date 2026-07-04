import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GradeSubmissionDto } from '../dto/grade-submission.dto';
import { SubmissionResponseDto } from '../dto/submission-response.dto';
import { SubmissionStatus } from '../../domains/entities/submission.entity';
import {
  type ISubmissionRepository,
  SUBMISSION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/submission.repository.interface';
import { SubmissionMapper } from '../../domains/mappers/submission.mapper';

@Injectable()
export class GradeSubmissionUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubmissionRepository,
    private readonly mapper: SubmissionMapper,
  ) {}

  async execute(
    submissionId: string,
    dto: GradeSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.subRepo.findById(submissionId);

    if (!submission) {
      throw new NotFoundException('Karya tidak ditemukan.');
    }

    // Update nilai dan status
    submission.score = dto.score;
    submission.status = SubmissionStatus.GRADED;

    // (Opsional) Jika Anda ingin menyimpan notes, Anda bisa menambah kolom di entity
    // submission.notes = dto.notes;

    const updatedSubmission = await this.subRepo.save(submission);
    return this.mapper.toResponseDto(updatedSubmission);
  }
}
