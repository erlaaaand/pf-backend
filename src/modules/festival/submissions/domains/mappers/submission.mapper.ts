import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SubmissionEntity } from '../entities/submission.entity';
import { SubmissionResponseDto } from '../../applications/dto/submission-response.dto';

@Injectable()
export class SubmissionMapper {
  toResponseDto(entity: SubmissionEntity): SubmissionResponseDto {
    if (!entity.id || !entity.submittedAt) {
      throw new InternalServerErrorException('Data submission korup.');
    }

    const dto = new SubmissionResponseDto();
    dto.id = entity.id;
    dto.registrationId = entity.registrationId;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.fileUrl = entity.fileUrl;
    dto.status = entity.status;
    dto.score = entity.score;
    dto.submittedAt = entity.submittedAt;

    return dto;
  }
}
