import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationStatus } from '../../domains/entities/registration.entity';

export class RegistrationResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() competitionId: string = '';
  @ApiProperty() competitionName: string = '';
  @ApiProperty() waveName: string = '';

  @ApiPropertyOptional() teamName: string | null = null;
  @ApiPropertyOptional() participantName: string | null = null; // Nama user jika individu

  @ApiProperty({ enum: RegistrationStatus })
  status: RegistrationStatus = RegistrationStatus.PENDING_PAYMENT;
  @ApiProperty() registeredAt: Date = new Date();
}
