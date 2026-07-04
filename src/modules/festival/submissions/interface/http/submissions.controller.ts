import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../identity/auth/interface/guards/jwt-auth.guard';
import { SubmissionsOrchestrator } from '../../applications/orchestrator/submissions.orchestrator';
import { CreateSubmissionDto } from '../../applications/dto/create-submission.dto';
import { SubmissionResponseDto } from '../../applications/dto/submission-response.dto';

export interface RequestWithUser extends Request {
  user: { id: string; email?: string; role?: string };
}

@ApiTags('Festival - Submissions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly orchestrator: SubmissionsOrchestrator) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Mengunggah karya lomba (Hanya jika pendaftaran VERIFIED)',
  })
  @ApiCreatedResponse({ type: SubmissionResponseDto })
  async createSubmission(
    @Req() req: RequestWithUser,
    @Body() dto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    return this.orchestrator.createSubmission(req.user.id, dto);
  }
}
