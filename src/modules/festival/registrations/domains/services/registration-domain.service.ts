import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CompetitionWaveEntity } from '../../../competitions/domains/entities/competition-wave.entity';
import {
  CompetitionEntity,
  CompetitionParticipantType,
} from '../../../competitions/domains/entities/competition.entity';
import {
  CompetitionRegistrationEntity,
  RegistrationStatus,
} from '../entities/registration.entity';

@Injectable()
export class RegistrationDomainService {
  /**
   * Hanya peserta individu itu sendiri, atau ketua tim (untuk lomba tim),
   * yang berhak mengunggah/mengganti bukti pembayaran registrasi ini.
   */
  assertCanManageProof(
    registration: CompetitionRegistrationEntity,
    requestingUserId: string,
  ): void {
    const isIndividualOwner = registration.userId === requestingUserId;
    const isTeamLeader = registration.team?.leaderId === requestingUserId;

    if (!isIndividualOwner && !isTeamLeader) {
      throw new ForbiddenException(
        'Anda tidak berhak mengunggah bukti pembayaran untuk pendaftaran ini.',
      );
    }
  }

  /**
   * Bukti pembayaran hanya boleh diunggah/diunggah ulang selama status
   * masih menunggu pembayaran atau baru saja ditolak bendahara.
   */
  assertCanUploadProof(registration: CompetitionRegistrationEntity): void {
    const allowedStatuses = [
      RegistrationStatus.PENDING_PAYMENT,
      RegistrationStatus.REJECTED,
    ];

    if (!allowedStatuses.includes(registration.status)) {
      throw new BadRequestException(
        registration.status === RegistrationStatus.PENDING_VERIFICATION
          ? 'Bukti pembayaran sudah diunggah dan sedang menunggu verifikasi bendahara.'
          : 'Pendaftaran ini sudah terverifikasi, tidak perlu mengunggah bukti pembayaran lagi.',
      );
    }
  }

  /**
   * Bendahara hanya dapat memverifikasi (approve/reject) pendaftaran yang
   * berstatus PENDING_VERIFICATION (yaitu sudah ada bukti pembayaran).
   */
  assertCanVerify(registration: CompetitionRegistrationEntity): void {
    const allowedStatuses = [
      RegistrationStatus.PENDING_VERIFICATION,
      RegistrationStatus.VERIFIED,
      RegistrationStatus.REJECTED,
    ];

    if (!allowedStatuses.includes(registration.status)) {
      throw new BadRequestException(
        'Pendaftaran ini tidak dapat diubah status verifikasinya karena belum mengunggah bukti atau sudah dibatalkan.',
      );
    }
  }

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
