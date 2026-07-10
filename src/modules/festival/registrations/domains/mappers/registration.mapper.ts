import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CompetitionRegistrationEntity,
  RegistrationStatus,
} from '../entities/registration.entity';
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

    const attempts = entity.paymentAttempts || [];
    attempts.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    const latestAttempt = attempts[0];

    if (latestAttempt) {
      dto.proofOfPaymentUrl = latestAttempt.proofOfPaymentUrl;
      dto.proofUploadedAt = latestAttempt.uploadedAt;
      dto.verificationNote = latestAttempt.rejectionReason;
      dto.verifiedAt = latestAttempt.verifiedAt;
    } else {
      dto.proofOfPaymentUrl = null;
      dto.proofUploadedAt = null;
      dto.verificationNote = null;
      dto.verifiedAt = null;
    }

    dto.paymentAttempts = attempts.map((attempt) => ({
      id: attempt.id,
      proofOfPaymentUrl: attempt.proofOfPaymentUrl,
      status: attempt.status,
      rejectionReason: attempt.rejectionReason,
      verifiedAt: attempt.verifiedAt,
      uploadedAt: attempt.uploadedAt,
    }));

    if (entity.team) {
      dto.institution = entity.team.institution;
      dto.members = entity.team.members ? entity.team.members.map(m => m.user ? (m.user.fullName ?? m.user.email) : 'Anggota Tidak Diketahui') : [];
      dto.teamName = entity.team.name;
      dto.teamLeaderId = entity.team.leaderId;
      if (entity.team.leader) {
        dto.participantName =
          entity.team.leader.fullName ?? entity.team.leader.email;
      }
    } else if (entity.user) {
      dto.institution = entity.user.institution;
      dto.members = [];
      dto.participantName = entity.user.fullName ?? entity.user.email;
    }

    // Sertakan link WA hanya jika registrasi sudah terverifikasi
    if (
      entity.status === RegistrationStatus.VERIFIED &&
      entity.competition?.whatsappGroupUrl
    ) {
      dto.whatsappGroupUrl = entity.competition.whatsappGroupUrl;
    } else {
      dto.whatsappGroupUrl = null;
    }

    return dto;
  }
}
