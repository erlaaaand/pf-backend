import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [AuditLogModule, SearchModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
