import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CompetitionRegistrationEntity,
  RegistrationStatus,
} from '../../domains/entities/registration.entity';
import { MootaMutationDto } from '../dto/moota-webhook.dto'; // Import DTO baru

@Injectable()
export class HandleMootaWebhookUseCase {
  private readonly logger = new Logger(HandleMootaWebhookUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(mutations: MootaMutationDto[]): Promise<void> {
    for (const mutasi of mutations) {
      if (mutasi.type !== 'CR') continue;

      const amountReceived = Number(mutasi.amount);
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.startTransaction();

      try {
        const pendingReg = await queryRunner.manager.findOne(
          CompetitionRegistrationEntity,
          {
            where: {
              billingAmount: amountReceived,
              status: RegistrationStatus.PENDING_PAYMENT,
            },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (pendingReg) {
          const now = new Date();
          if (pendingReg.expiresAt && now > pendingReg.expiresAt) {
            pendingReg.status = RegistrationStatus.CANCELLED;
            this.logger.warn(
              `Pembayaran Rp ${amountReceived} terlambat masuk (Expired). ID: ${pendingReg.id}`,
            );
          } else {
            pendingReg.status = RegistrationStatus.VERIFIED;
            this.logger.log(
              `Pembayaran Otomatis Berhasil: ID ${pendingReg.id}`,
            );
          }

          await queryRunner.manager.save(
            CompetitionRegistrationEntity,
            pendingReg,
          );
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Gagal memproses mutasi Rp ${amountReceived}`, error);
      } finally {
        await queryRunner.release();
      }
    }
  }
}
