import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class UploadPaymentProofDto {
  @ApiProperty({ example: 'uuid-rekening-panitia' })
  @IsUUID()
  @IsNotEmpty()
  paymentAccountId: string = '';

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  senderName: string = '';

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(10000)
  amount: number = 0;

  @ApiProperty({
    description: 'URL gambar bukti transfer yang sudah diunggah ke storage',
    example: 'https://storage.com/bukti-transfer-budi.jpg',
  })
  @IsString()
  @IsNotEmpty()
  proofUrl: string = '';
}
