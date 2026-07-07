import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class MootaMutationDto {
  @ApiProperty({ example: 'bca-123' })
  @IsString()
  @IsNotEmpty()
  bank_id: string = '';

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  account_number: string = '';

  @ApiProperty({ example: '2026-07-06 14:00:00' })
  @IsString()
  @IsNotEmpty()
  date: string = '';

  @ApiProperty({
    example: 'CR',
    description: 'CR untuk Credit/Masuk, DB untuk Debit/Keluar',
  })
  @IsString()
  @IsNotEmpty()
  type: string = '';

  @ApiProperty({ example: 150123 })
  @IsNumber()
  @IsNotEmpty()
  amount: number = 0;

  @ApiPropertyOptional({ example: 'TRANSFER DARI IBANK BUDI SANTOSO' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 2000000 })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiProperty({ example: 'mut-999888777' })
  @IsString()
  @IsNotEmpty()
  mutation_id: string = '';
}
