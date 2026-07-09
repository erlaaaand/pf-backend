import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RegistrationStatus,
  ChampionTitle,
} from '../../domains/entities/registration.entity';

export class RegistrationResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() competitionId: string = '';
  @ApiProperty() competitionName: string = '';
  @ApiProperty() waveName: string = '';

  @ApiPropertyOptional() teamName: string | null = null;
  @ApiPropertyOptional() participantName: string | null = null; // Nama user jika individu

  @ApiProperty({ enum: RegistrationStatus })
  status: RegistrationStatus = RegistrationStatus.PENDING_PAYMENT;
  @ApiProperty({ enum: ChampionTitle })
  championTitle: ChampionTitle = ChampionTitle.NONE;
  @ApiProperty() registeredAt: Date = new Date();

  @ApiPropertyOptional({
    description: 'URL bukti pembayaran yang diunggah peserta.',
  })
  proofOfPaymentUrl?: string | null;
  @ApiPropertyOptional({ description: 'Waktu bukti pembayaran diunggah.' })
  proofUploadedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Catatan dari bendahara (terutama jika ditolak).',
  })
  verificationNote?: string | null;
  @ApiPropertyOptional({ description: 'Waktu verifikasi oleh bendahara.' })
  verifiedAt?: Date | null;
}
