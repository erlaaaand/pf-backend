import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({
  timestamps: true,
  collection: 'audit_logs',
})
export class AuditLog {
  @Prop({ required: true, index: true })
  action: string = '';

  @Prop({ required: true, index: true })
  performedBy: string = '';

  @Prop({ required: true })
  entityType: string = '';

  @Prop()
  entityId: string = '';

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  metadata: Record<string, unknown> = {};

  @Prop()
  ipAddress: string = '';

  @Prop()
  userAgent: string = '';
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexing for faster queries on common audit combinations
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });
