import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ example: 85.5, description: 'Nilai karya antara 0 - 100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number = 0;

  @ApiPropertyOptional({
    example:
      'Karya sangat inovatif, namun perlu perbaikan pada bagian latar belakang.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
