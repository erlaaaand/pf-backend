import { Injectable } from '@nestjs/common';
import { RegisterCompetitionDto } from '../dto/register-competition.dto';
import { RegistrationResponseDto } from '../dto/registration-response.dto';
import { UploadPaymentProofDto } from '../dto/upload-payment-proof.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';

import { RegisterCompetitionUseCase } from '../use-cases/register-competition.use-case';
import { GetMyRegistrationsUseCase } from '../use-cases/get-my-registrations.use-case';
import { UploadPaymentProofUseCase } from '../use-cases/upload-payment-proof.use-case';
import { VerifyPaymentUseCase } from '../use-cases/verify-payment.use-case';

@Injectable()
export class RegistrationsOrchestrator {
  constructor(
    private readonly registerUc: RegisterCompetitionUseCase,
    private readonly getMyRegsUc: GetMyRegistrationsUseCase,
    private readonly uploadProofUc: UploadPaymentProofUseCase,
    private readonly verifyPaymentUc: VerifyPaymentUseCase,
  ) {}

  async register(
    userId: string,
    dto: RegisterCompetitionDto,
  ): Promise<RegistrationResponseDto> {
    return this.registerUc.execute(userId, dto);
  }

  async getMyRegistrations(userId: string): Promise<RegistrationResponseDto[]> {
    return this.getMyRegsUc.execute(userId);
  }

  async uploadPaymentProof(
    userId: string,
    registrationId: string,
    dto: UploadPaymentProofDto,
  ) {
    return this.uploadProofUc.execute(userId, registrationId, dto);
  }

  async verifyPayment(paymentId: string, dto: VerifyPaymentDto) {
    return this.verifyPaymentUc.execute(paymentId, dto);
  }
}
