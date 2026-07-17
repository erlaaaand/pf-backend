import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { UserEntity } from '../../identity/users/domains/entities/user.entity';
import { SandboxAuditLog, SandboxAuditLogSchema } from './entities/sandbox-audit-log.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MongooseModule.forFeature([{ name: SandboxAuditLog.name, schema: SandboxAuditLogSchema }])
  ],
  controllers: [SimulationController],
  providers: [SimulationService],
})
export class SimulationModule {}
