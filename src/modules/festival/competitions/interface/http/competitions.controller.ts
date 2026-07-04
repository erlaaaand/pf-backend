import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CompetitionsOrchestrator } from '../../applications/orchestrator/competitions.orchestrator';
import { CompetitionResponseDto } from '../../applications/dto/competition-response.dto';
import { CreateCompetitionDto } from '../../applications/dto/create-competition.dto';
import { UpdateCompetitionDto } from '../../applications/dto/update-competition.dto';
import { UpdateWaveDto } from '../../applications/dto/update-wave.dto';
import { CompetitionWaveDto } from '../../applications/dto/competition-response.dto';

import { JwtAuthGuard } from '../../../../identity/auth/interface/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../identity/auth/interface/guards/roles.guard';
import { Roles } from '../../../../identity/auth/interface/decorators/roles.decorator';
import { Public } from '../../../../identity/auth/interface/decorators/public.decorator';
import { UserRole } from '../../../../identity/users/domains/entities/user.entity';

@ApiTags('Competitions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('competitions')
@UseInterceptors(CacheInterceptor)
export class CompetitionsController {
  constructor(private readonly orchestrator: CompetitionsOrchestrator) {}

  @Public()
  @Get()
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Mendapatkan daftar semua perlombaan',
    description:
      'Menampilkan katalog lomba beserta gelombang pendaftarannya. Endpoint ini bersifat publik.',
    operationId: 'competitionsGetAll',
  })
  @ApiOkResponse({ type: [CompetitionResponseDto] })
  getAll(): Promise<CompetitionResponseDto[]> {
    return this.orchestrator.getAll();
  }

  @Public()
  @Get(':id')
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Mendapatkan detail satu perlombaan',
    description:
      'Menampilkan detail lengkap beserta batas tim dan gelombang yang aktif.',
    operationId: 'competitionsGetDetail',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: CompetitionResponseDto })
  getDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CompetitionResponseDto> {
    return this.orchestrator.getDetail(id);
  }

  // KHUSUS ADMIN
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '(ADMIN) Menambahkan perlombaan beserta gelombangnya',
  })
  @ApiCreatedResponse({ type: CompetitionResponseDto })
  create(@Body() dto: CreateCompetitionDto): Promise<CompetitionResponseDto> {
    return this.orchestrator.create(dto);
  }

  // KHUSUS ADMIN
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '(ADMIN) Memperbarui data perlombaan (soft disable, dll)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: CompetitionResponseDto })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateCompetitionDto,
  ): Promise<CompetitionResponseDto> {
    return this.orchestrator.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '(ADMIN) Menonaktifkan lomba (Soft Delete)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  softDelete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    return this.orchestrator.softDelete(id);
  }

  @Patch('waves/:waveId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '(ADMIN) Memperbarui harga atau jadwal gelombang (Wave) tertentu',
  })
  @ApiParam({ name: 'waveId', format: 'uuid' })
  @ApiOkResponse({ type: CompetitionWaveDto })
  async updateWave(
    @Param('waveId', new ParseUUIDPipe({ version: '4' })) waveId: string,
    @Body() dto: UpdateWaveDto,
  ): Promise<CompetitionWaveDto> {
    return this.orchestrator.updateWave(waveId, dto);
  }
}
