import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  ParseArrayPipe,
  UnauthorizedException,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { Public } from '../../../../identity/auth/interface/decorators/public.decorator';
import { HandleMootaWebhookUseCase } from '../../applications/use-cases/handle-moota-webhook.use-case';
import { MootaMutationDto } from '../../applications/dto/moota-webhook.dto';

@ApiTags('Webhook - Moota')
@Controller('webhook/moota')
export class MootaWebhookController {
  constructor(private readonly webhookUc: HandleMootaWebhookUseCase) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Menerima callback mutasi dari Moota (Bisa untuk Mock Testing)',
  })
  @ApiHeader({
    name: 'signature',
    description: 'Untuk testing lokal, ketik: dummy-signature-123',
    required: true,
  })
  @ApiBody({ type: [MootaMutationDto] })
  async handleCallback(
    @Headers('signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Body(new ParseArrayPipe({ items: MootaMutationDto }))
    payload: MootaMutationDto[],
  ) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const MOOTA_SECRET = process.env.MOOTA_SECRET_KEY || 'rahasia';

    // --- 1. JALUR MOCK TESTING (DEVELOPMENT ONLY) ---
    if (isDevelopment && signature === 'dummy-signature-123') {
      await this.webhookUc.execute(payload);
      return { success: true, message: 'Mock payload processed' };
    }

    // --- 2. JALUR PRODUCTION (VALIDASI ASLI) ---
    if (!signature) {
      throw new UnauthorizedException('Header signature tidak ditemukan.');
    }
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new UnauthorizedException(
        'Raw body tidak tersedia untuk verifikasi signature.',
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', MOOTA_SECRET)
      .update(rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    const isValidSignature =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValidSignature) {
      throw new UnauthorizedException('Signature tidak valid.');
    }

    await this.webhookUc.execute(payload);
    return { success: true };
  }
}
