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
    dto.registeredAt = entity.registeredAt;

    if (entity.team) {
      dto.teamName = entity.team.name;
    } else if (entity.user) {
      dto.participantName = entity.user.fullName ?? entity.user.email;
    }

    return dto;
  }
}
