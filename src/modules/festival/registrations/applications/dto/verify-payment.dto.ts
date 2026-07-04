import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentVerificationStatus } from '../../domains/entities/payment.entity';

export class VerifyPaymentDto {
  @ApiProperty({ enum: PaymentVerificationStatus })
  @IsEnum(PaymentVerificationStatus)
  status: PaymentVerificationStatus = PaymentVerificationStatus.PENDING;

  @ApiPropertyOptional({ example: 'Bukti transfer buram / nominal kurang.' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
