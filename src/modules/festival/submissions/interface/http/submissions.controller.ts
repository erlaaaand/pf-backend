import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../identity/auth/interface/guards/jwt-auth.guard';
import { SubmissionsOrchestrator } from '../../applications/orchestrator/submissions.orchestrator';
import { CreateSubmissionDto } from '../../applications/dto/create-submission.dto';
import { FileUploadInterceptor } from '../../../../shared/storage/interface/interceptors/file-upload.interceptor';
import { Roles } from '../../../../identity/auth/interface/decorators/roles.decorator';
import { RolesGuard } from '../../../../identity/auth/interface/guards/roles.guard';
import { UserRole } from '../../../../identity/users/domains/entities/user.entity';
export interface RequestWithUser extends Request {
  user: { id: string; email?: string; role?: string };
}

@ApiTags('Festival - Submissions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly orchestrator: SubmissionsOrchestrator) {}

  // --- AREA PESERTA ---
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.PARTICIPANT)
  @UseInterceptors(FileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Mengunggah karya (Hanya Peserta)' })
  async createSubmission(
    @Req() req: RequestWithUser,
    @Body() dto: CreateSubmissionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.orchestrator.createSubmission(req.user.id, dto, file);
  }

  @Get('my-submission/:registrationId')
  @Roles(UserRole.PARTICIPANT)
  @ApiOperation({ summary: 'Melihat karya lomba sendiri' })
  async getMySubmission(
    @Param('registrationId', new ParseUUIDPipe()) registrationId: string,
  ) {
    return this.orchestrator.getMySubmission(registrationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.PARTICIPANT)
  @ApiOperation({
    summary: 'Membatalkan/Menghapus karya (Hanya jika belum dinilai)',
  })
  async deleteSubmission(
    @Req() req: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.orchestrator.deleteSubmission(id, req.user.id);
  }

  // --- AREA PANITIA / JURI ---
  @Get('competition/:competitionId')
  @Roles(UserRole.ADMIN, UserRole.COMMITTEE)
  @ApiOperation({
    summary:
      'Melihat semua karya yang terkumpul pada satu lomba (Khusus Panitia)',
  })
  async getSubmissionsByCompetition(
    @Param('competitionId', new ParseUUIDPipe()) competitionId: string,
  ) {
    return this.orchestrator.getSubmissionsByCompetition(competitionId);
  }
}
