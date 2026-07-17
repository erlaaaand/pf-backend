import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../../identity/users/domains/entities/user.entity';

@Controller()
export class SandboxWorker {
  private readonly logger = new Logger(SandboxWorker.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  @EventPattern('simulation.sandbox_insert')
  async handleSandboxInsert(@Payload() data: Record<string, unknown>) {
    try {
      // Data contains { id, email, fullName, institution, phoneNumber, password }
      await this.userRepo.save({
        ...data,
        role: UserRole.PARTICIPANT,
        isActive: true,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to process sandbox user insert: ${err.message}`);
    }
  }
}
