import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import {
  PaymentEntity,
  PaymentVerificationStatus,
} from '../../domains/entities/payment.entity';
import {
  CompetitionRegistrationEntity,
  RegistrationStatus,
} from '../../domains/entities/registration.entity';

@Injectable()
export class VerifyPaymentUseCase {
  private readonly logger = new Logger(VerifyPaymentUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(
    paymentId: string,
    dto: VerifyPaymentDto,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // 1. Mulai transaksi SEBELUM melakukan pencarian data
    await queryRunner.startTransaction();

    try {
      // 2. Cari data sekaligus kunci baris ini di database (Pessimistic Write)
      const payment = await queryRunner.manager.findOne(PaymentEntity, {
        where: { id: paymentId },
        relations: { registration: true },
        lock: { mode: 'pessimistic_write' }, // <--- KUNCI UTAMA ANTI-RACE CONDITION
      });

      if (!payment) {
        throw new BadRequestException('Data pembayaran tidak ditemukan.');
      }

      // 3. Validasi status: Tolak jika sudah diverifikasi/ditolak sebelumnya
      if (payment.status !== PaymentVerificationStatus.PENDING) {
        throw new BadRequestException(
          `Pembayaran ini sudah diproses sebelumnya (Status saat ini: ${payment.status}).`,
        );
      }

      const registration = payment.registration;
      if (!registration) {
        throw new BadRequestException('Data pendaftaran terkait tidak valid.');
      }

      // 4. Ubah status sesuai input admin
      payment.status = dto.status;

      if (dto.status === PaymentVerificationStatus.REJECTED) {
        payment.rejectionReason =
          dto.rejectionReason ?? 'Ditolak oleh admin tanpa keterangan.';
        registration.status = RegistrationStatus.REJECTED;
      } else if (dto.status === PaymentVerificationStatus.VERIFIED) {
        registration.status = RegistrationStatus.VERIFIED;
      }

      // 5. Simpan perubahan ke database
      await queryRunner.manager.save(PaymentEntity, payment);
      await queryRunner.manager.save(
        CompetitionRegistrationEntity,
        registration,
      );

      // 6. Lepaskan kunci dan commit transaksi
      await queryRunner.commitTransaction();

      return { message: `Pembayaran berhasil diubah menjadi ${dto.status}.` };
    } catch (error) {
      // Jika terjadi error atau validasi gagal, batalkan semuanya (Rollback)
      await queryRunner.rollbackTransaction();

      if (error instanceof BadRequestException) {
        throw error; // Lemparkan error validasi ke frontend
      }

      this.logger.error(
        'Gagal memverifikasi pembayaran.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Gagal memverifikasi pembayaran karena kesalahan sistem.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
