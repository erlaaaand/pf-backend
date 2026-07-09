import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RegistrationResponseDto } from '../dto/registration-response.dto';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/registration.repository.interface';
import { RegistrationStatus } from '../../domains/entities/registration.entity';
import { RegistrationDomainService } from '../../domains/services/registration-domain.service';
import { RegistrationMapper } from '../../domains/mappers/registration.mapper';
import { StorageOrchestrator } from '../../../../shared/storage/applications/orchestrator/storage.orchestrator';
import { FilePurpose } from '../../../../shared/storage/domains/entities/stored-file.entity';

@Injectable()
export class UploadPaymentProofUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    private readonly domainService: RegistrationDomainService,
    private readonly mapper: RegistrationMapper,
    private readonly storageOrchestrator: StorageOrchestrator,
  ) {}

  async execute(
    registrationId: string,
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<RegistrationResponseDto> {
    // 1. Ambil data registrasi
    const registration = await this.regRepo.findById(registrationId);
    if (!registration) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan.');
    }

    // 2. Validasi kepemilikan & status
    this.domainService.assertCanManageProof(registration, userId);
    this.domainService.assertCanUploadProof(registration);

    const previousFileId = registration.proofOfPaymentFileId;

    // 3. Upload file lewat Storage Module (validasi tipe/ukuran ditangani di sana)
    const uploaded = await this.storageOrchestrator.upload(
      file,
      { context: 'payment-proofs', purpose: FilePurpose.PAYMENT_PROOF },
      userId,
    );

    // 4. Update registrasi dengan bukti pembayaran baru
    registration.proofOfPaymentFileId = uploaded.storedFileId;
    registration.proofOfPaymentUrl = uploaded.fileUrl;
    registration.proofUploadedAt = new Date();
    registration.status = RegistrationStatus.PENDING_VERIFICATION;
    registration.verificationNote = null;
    registration.verifiedAt = null;
    registration.verifiedBy = null;

    const saved = await this.regRepo.save(registration);

    // 5. Bersihkan file bukti lama (jika ada re-upload setelah ditolak).
    // Kegagalan hapus file lama tidak boleh menggagalkan proses utama.
    if (previousFileId && previousFileId !== uploaded.storedFileId) {
      try {
        await this.storageOrchestrator.delete(previousFileId, userId);
      } catch {
        // best-effort cleanup, abaikan kegagalan
      }
    }

    const complete = await this.regRepo.findById(saved.id);
    return this.mapper.toResponseDto(complete!);
  }
}
