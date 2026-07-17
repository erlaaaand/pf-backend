import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'sandbox_audit_logs', timestamps: true })
export class SandboxAuditLog extends Document {
  @Prop({ required: true })
  action: string = '';

  @Prop({ type: Object })
  details: Record<string, unknown> = {};
}

export const SandboxAuditLogSchema = SchemaFactory.createForClass(SandboxAuditLog);
