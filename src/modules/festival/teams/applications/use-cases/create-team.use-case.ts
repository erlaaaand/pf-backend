// src/festival/teams/applications/use-cases/create-team.use-case.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTeamDto } from '../dto/create-team.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import {
  type ITeamRepository,
  TEAM_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/team.repository.interface';
import { TeamEntity } from '../../domains/entities/team.entity';
import { TeamMapper } from '../../domains/mappers/team.mapper';
import {
  USER_REPOSITORY_TOKEN,
  type IUserRepository,
} from '../../../../identity/users/infrastructures/repositories/user.repository.interface';
import { isDuplicateKeyError } from '../../../../shared/utils/database-error.util';

@Injectable()
export class CreateTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_TOKEN)
    private readonly teamRepo: ITeamRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
    private readonly mapper: TeamMapper,
  ) {}

  async execute(
    leaderId: string,
    dto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    // 1. Cek User
    const leader = await this.userRepo.findById(leaderId);

    if (!leader) {
      throw new BadRequestException('Data user tidak valid.');
    }

    // 2. Validasi Instansi (Strict Mode - Tanpa any)
    // TypeScript akan membaca properti ini dari UserEntity
    const institution = leader.institution;

    if (!institution) {
      throw new BadRequestException(
        'Anda harus melengkapi profil (asal sekolah/instansi) sebelum membuat tim.',
      );
    }

    // 3. Cek apakah user sudah punya tim
    const existingTeam = await this.teamRepo.findByUserId(leaderId);
    if (existingTeam) {
      throw new BadRequestException('Anda sudah tergabung dalam sebuah tim.');
    }

    // 4. Cek nama tim duplikat
    const nameTaken = await this.teamRepo.findByName(dto.name);
    if (nameTaken) {
      throw new BadRequestException('Nama tim ini sudah digunakan.');
    }

    // 5. Buat dan Simpan (Memanfaatkan default value yang jujur dari entitas)
    const team = new TeamEntity();
    team.name = dto.name;
    team.institution = institution;
    team.leaderId = leaderId;

    let savedTeam: TeamEntity;
    try {
      savedTeam = await this.teamRepo.save(team);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw new BadRequestException(
          'Anda sudah tergabung dalam sebuah tim, atau nama tim ini sudah digunakan.',
        );
      }
      throw err;
    }

    // 6. Validasi ulang ID setelah save (Strict Mode)
    if (!savedTeam.id) {
      throw new InternalServerErrorException(
        'Terjadi kesalahan, gagal mendapatkan ID tim setelah disimpan.',
      );
    }

    // 7. Tarik ulang data untuk mendapatkan relasi leader secara utuh dari database
    const completeTeam = await this.teamRepo.findById(savedTeam.id);

    if (!completeTeam) {
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat memuat ulang data tim.',
      );
    }

    return this.mapper.toResponseDto(completeTeam);
  }
}
