import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CompetitionsOrchestrator } from '../../applications/orchestrator/competitions.orchestrator';
import { CompetitionResponseDto } from '../../applications/dto/competition-response.dto';
import { Public } from '../../../../identity/auth/interface/decorators/public.decorator';

@ApiTags('Competitions')
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
}
