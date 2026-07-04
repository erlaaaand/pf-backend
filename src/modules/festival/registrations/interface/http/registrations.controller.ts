import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../identity/auth/interface/guards/jwt-auth.guard';
import { RegistrationsOrchestrator } from '../../applications/orchestrator/registrations.orchestrator';
import { RegisterCompetitionDto } from '../../applications/dto/register-competition.dto';
import { RegistrationResponseDto } from '../../applications/dto/registration-response.dto';
import { UploadPaymentProofDto } from '../../applications/dto/upload-payment-proof.dto';
import { VerifyPaymentDto } from '../../applications/dto/verify-payment.dto';
import { Roles } from 'src/modules/identity/auth/interface/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/identity/auth/interface/guards/roles.guard';
import { UserRole } from 'src/modules/identity/users/domains/entities/user.entity';

export interface RequestWithUser extends Request {
  user: { id: string; email?: string; role?: string };
}

@ApiTags('Festival - Registrations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly orchestrator: RegistrationsOrchestrator) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mendaftar ke sebuah lomba (Individu / Tim)' })
  @ApiCreatedResponse({ type: RegistrationResponseDto })
  @Roles(UserRole.PARTICIPANT)
  async register(
    @Req() req: RequestWithUser,
    @Body() dto: RegisterCompetitionDto,
  ): Promise<RegistrationResponseDto> {
    return this.orchestrator.register(req.user.id, dto);
  }

  @Get('my-registrations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Melihat seluruh riwayat pendaftaran pengguna & timnya',
  })
  @ApiOkResponse({ type: [RegistrationResponseDto] })
  async getMyRegistrations(
    @Req() req: RequestWithUser,
  ): Promise<RegistrationResponseDto[]> {
    return this.orchestrator.getMyRegistrations(req.user.id);
  }

  @Post(':id/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mengunggah bukti transfer pembayaran pendaftaran' })
  @ApiParam({ name: 'id', description: 'ID Pendaftaran (Registration ID)' })
  @Roles(UserRole.PARTICIPANT)
  async uploadPaymentProof(
    @Req() req: RequestWithUser,
    @Param('id') registrationId: string,
    @Body() dto: UploadPaymentProofDto,
  ) {
    return this.orchestrator.uploadPaymentProof(
      req.user.id,
      registrationId,
      dto,
    );
  }

  @Patch('payments/:paymentId/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '(ADMIN) Memverifikasi atau menolak bukti transfer',
  })
  @ApiParam({ name: 'paymentId', description: 'ID Pembayaran (Payment ID)' })
  @Roles(UserRole.ADMIN, UserRole.COMMITTEE)
  async verifyPayment(
    @Req() req: RequestWithUser,
    @Param('paymentId') paymentId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.orchestrator.verifyPayment(paymentId, dto);
  }
}
