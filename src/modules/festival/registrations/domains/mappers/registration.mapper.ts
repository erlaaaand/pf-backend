import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CompetitionRegistrationEntity } from '../entities/registration.entity';
import { RegistrationResponseDto } from '../../applications/dto/registration-response.dto';

@Injectable()
export class RegistrationMapper {
  toResponseDto(
    entity: CompetitionRegistrationEntity,
  ): RegistrationResponseDto {
    if (!entity.id || !entity.registeredAt) {
      throw new InternalServerErrorException(
        'Data registrasi tidak lengkap (ID/Tanggal null).',
      );
    }
    if (!entity.competition || !entity.wave) {
      throw new InternalServerErrorException(
        'Relasi lomba/gelombang gagal ditarik dari database.',
      );
    }

    const dto = new RegistrationResponseDto();
    dto.id = entity.id;
    dto.competitionId = entity.competitionId;
    dto.competitionName = entity.competition.name ?? 'Lomba Tanpa Nama';
    dto.waveName = entity.wave.name ?? 'Gelombang Reguler';
    dto.status = entity.status;
    dto.championTitle = entity.championTitle;
    dto.registeredAt = entity.registeredAt;

    dto.proofOfPaymentUrl = entity.proofOfPaymentUrl;
    dto.proofUploadedAt = entity.proofUploadedAt;

    dto.verificationNote = entity.verificationNote;
    dto.verifiedAt = entity.verifiedAt;

    if (entity.team) {
      dto.teamName = entity.team.name;
      if (entity.team.leader) {
        dto.participantName =
          entity.team.leader.fullName ?? entity.team.leader.email;
      }
    } else if (entity.user) {
      dto.participantName = entity.user.fullName ?? entity.user.email;
    }

    return dto;
  }
}
