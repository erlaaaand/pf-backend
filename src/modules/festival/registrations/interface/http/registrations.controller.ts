import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../identity/auth/interface/guards/jwt-auth.guard';
import { RegistrationsOrchestrator } from '../../applications/orchestrator/registrations.orchestrator';
import { RegisterCompetitionDto } from '../../applications/dto/register-competition.dto';
import { RegistrationResponseDto } from '../../applications/dto/registration-response.dto';
import { Roles } from 'src/modules/identity/auth/interface/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/identity/auth/interface/guards/roles.guard';
import { UserRole } from 'src/modules/identity/users/domains/entities/user.entity';
import { ChampionTitle } from '../../domains/entities/registration.entity';

export interface JwtPayload {
  id?: string;
  sub?: string;
  userId?: string;
  email?: string;
  role?: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
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
    const activeUserId = req.user.id || req.user.sub || req.user.userId;
    if (!activeUserId) {
      throw new UnauthorizedException(
        'Gagal memverifikasi identitas. Format token tidak dikenali.',
      );
    }
    return this.orchestrator.register(activeUserId, dto);
  }

  @Get('my-registrations')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.PARTICIPANT)
  @ApiOperation({
    summary: 'Melihat seluruh riwayat pendaftaran pengguna & timnya',
  })
  @ApiOkResponse({ type: [RegistrationResponseDto] })
  async getMyRegistrations(
    @Req() req: RequestWithUser,
  ): Promise<RegistrationResponseDto[]> {
    const activeUserId = req.user.id || req.user.sub || req.user.userId;

    if (!activeUserId) {
      throw new UnauthorizedException(
        'Gagal memverifikasi identitas. Format token tidak dikenali.',
      );
    }

    return this.orchestrator.getMyRegistrations(activeUserId);
  }

  @Get('admin/competition/:competitionId/verified')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.COMMITTEE) // Proteksi admin
  @ApiOperation({
    summary:
      'Melihat seluruh pendaftar tervalidasi pada suatu lomba (Khusus Admin)',
  })
  @ApiOkResponse({ type: [RegistrationResponseDto] })
  async getVerifiedParticipants(
    @Param('competitionId', new ParseUUIDPipe({ version: '4' }))
    competitionId: string,
  ): Promise<RegistrationResponseDto[]> {
    return this.orchestrator.getVerifiedRegistrationsByCompetition(
      competitionId,
    );
  }

  @Patch('admin/:id/set-champion')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.COMMITTEE) // Proteksi admin
  @ApiOperation({
    summary: 'Menetapkan gelar juara untuk peserta/tim (Khusus Admin)',
  })
  @ApiBody({
    schema: {
      properties: {
        title: { type: 'string', enum: Object.values(ChampionTitle) },
      },
    },
  })
  @ApiOkResponse({ type: RegistrationResponseDto })
  async setChampion(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body('title') title: ChampionTitle,
  ): Promise<RegistrationResponseDto> {
    return this.orchestrator.setChampionTitle(id, title);
  }
}
