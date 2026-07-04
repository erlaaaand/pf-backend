import { BadRequestException, Injectable } from '@nestjs/common';
import { CompetitionWaveEntity } from '../../../competitions/domains/entities/competition-wave.entity';
import {
  CompetitionEntity,
  CompetitionParticipantType,
} from '../../../competitions/domains/entities/competition.entity';

@Injectable()
export class RegistrationDomainService {
  validateWaveIsActive(wave: CompetitionWaveEntity): void {
    const now = new Date();
    if (!wave.startDate || !wave.endDate) {
      throw new BadRequestException(
        'Jadwal gelombang pendaftaran tidak valid.',
      );
    }
    if (now < wave.startDate) {
      throw new BadRequestException('Gelombang pendaftaran ini belum dibuka.');
    }
    if (now > wave.endDate) {
      throw new BadRequestException('Gelombang pendaftaran ini sudah ditutup.');
    }
  }

  validateCompetitionType(
    competition: CompetitionEntity,
    teamId?: string,
  ): void {
    // Perbaikan syntax error: Memberi string 'TEAM' sebagai perbandingan
    const isTeamCompetition =
      competition.participantType === CompetitionParticipantType.TEAM;
    if (isTeamCompetition && !teamId) {
      throw new BadRequestException(
        'Lomba ini adalah lomba berkelompok. Anda harus menyertakan ID Tim.',
      );
    }
    if (!isTeamCompetition && teamId) {
      throw new BadRequestException(
        'Lomba ini adalah lomba individu. Tidak perlu menyertakan ID Tim.',
      );
    }
  }
}
