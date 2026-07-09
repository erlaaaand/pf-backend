import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegistrationResponseDto } from '../dto/registration-response.dto';
import {
  VerificationAction,
  VerifyPaymentDto,
} from '../dto/verify-payment.dto';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/registration.repository.interface';
import { RegistrationStatus } from '../../domains/entities/registration.entity';
import { RegistrationDomainService } from '../../domains/services/registration-domain.service';
import { RegistrationMapper } from '../../domains/mappers/registration.mapper';

@Injectable()
export class VerifyPaymentUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    private readonly domainService: RegistrationDomainService,
    private readonly mapper: RegistrationMapper,
  ) {}

  async execute(
    registrationId: string,
    bendaharaUserId: string,
    dto: VerifyPaymentDto,
  ): Promise<RegistrationResponseDto> {
    const registration = await this.regRepo.findById(registrationId);
    if (!registration) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan.');
    }

    this.domainService.assertCanVerify(registration);

    if (dto.action === VerificationAction.REJECT && !dto.note?.trim()) {
      throw new BadRequestException(
        'Catatan penolakan wajib diisi agar peserta tahu apa yang perlu diperbaiki.',
      );
    }

    registration.status =
      dto.action === VerificationAction.APPROVE
        ? RegistrationStatus.VERIFIED
        : RegistrationStatus.REJECTED;
    registration.verificationNote = dto.note ?? null;
    registration.verifiedAt = new Date();
    registration.verifiedBy = bendaharaUserId;

    const saved = await this.regRepo.save(registration);
    const complete = await this.regRepo.findById(saved.id);
    return this.mapper.toResponseDto(complete!);
  }
}
