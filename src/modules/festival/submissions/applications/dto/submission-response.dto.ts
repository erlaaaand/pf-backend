import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '../../domains/entities/submission.entity';

export class SubmissionResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() registrationId: string = '';
  @ApiProperty() title: string = '';
  @ApiPropertyOptional() description: string | null = null;
  @ApiProperty() fileUrl: string = '';
  @ApiProperty({ enum: SubmissionStatus }) status: SubmissionStatus =
    SubmissionStatus.DRAFT;
  @ApiPropertyOptional() score: number | null = null;
  @ApiProperty() submittedAt: Date = new Date();
}
