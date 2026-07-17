import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamSyncWorker } from './team-sync.worker';
import { SandboxWorker } from './sandbox.worker';
import { UserEntity } from '../../identity/users/domains/entities/user.entity';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), SearchModule],
  controllers: [TeamSyncWorker, SandboxWorker],
  providers: [],
})
export class WorkersModule {}
