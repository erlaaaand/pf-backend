import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface CreateAuditLogDto {
  action: string;
  performedBy: string; // e.g. User ID or System
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Logs an action asynchronously.
   * We do not await the save operation to avoid blocking the main thread
   * of the calling function, ensuring high performance.
   */
  logAction(dto: CreateAuditLogDto): void {
    const newLog = new this.auditLogModel(dto);
    newLog.save().catch((err: Error) => {
      this.logger.error(`Failed to save audit log: ${err.message}`, err.stack);
    });
  }

  /**
   * Retrieves audit logs with optional filtering.
   */
  async getLogs(
    filter: Partial<CreateAuditLogDto>,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
