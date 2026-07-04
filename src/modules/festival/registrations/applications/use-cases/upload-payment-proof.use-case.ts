import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UploadPaymentProofDto } from '../dto/upload-payment-proof.dto';
import { PaymentEntity } from '../../domains/entities/payment.entity';
import { RegistrationStatus } from '../../domains/entities/registration.entity';
// Import token repository (asumsikan Anda sudah membuat interface dan implementasinya)
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/registration.repository.interface';
import {
  type IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/payment.repository.interface';

@Injectable()
export class UploadPaymentProofUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(
    userId: string,
    registrationId: string,
    dto: UploadPaymentProofDto,
  ): Promise<{ message: string }> {
    // 1. Cek Pendaftaran (Pastikan milik dia atau timnya)
    const registration = await this.regRepo.findById(registrationId);

    if (!registration) {
      throw new BadRequestException('Data pendaftaran tidak ditemukan.');
    }

    // Pengecekan otorisasi (Apakah ini pendaftarannya / timnya)
    const isOwner = registration.userId === userId;
    const isLeader = registration.team?.leaderId === userId;

    if (!isOwner && !isLeader) {
      throw new BadRequestException(
        'Anda tidak memiliki akses untuk mengunggah bukti pada pendaftaran ini.',
      );
    }

    // Pastikan statusnya memang sedang menunggu pembayaran atau sebelumnya ditolak
    if (
      registration.status !== RegistrationStatus.PENDING_PAYMENT &&
      registration.status !== RegistrationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Pendaftaran ini tidak dalam status membutuhkan pembayaran.',
      );
    }

    // 2. Buat Entitas Pembayaran
    const payment = new PaymentEntity();
    payment.registrationId = registrationId;
    payment.paymentAccountId = dto.paymentAccountId;
    payment.senderName = dto.senderName;
    payment.amount = dto.amount;
    payment.proofUrl = dto.proofUrl;

    await this.paymentRepo.save(payment);

    // 3. Update Status Pendaftaran
    registration.status = RegistrationStatus.PENDING_VERIFICATION;
    await this.regRepo.save(registration);

    return {
      message:
        'Bukti transfer berhasil diunggah. Silakan tunggu verifikasi admin.',
    };
  }
}
