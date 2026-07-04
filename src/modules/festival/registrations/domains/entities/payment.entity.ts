import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompetitionRegistrationEntity } from './registration.entity';
import { PaymentAccountEntity } from './payment-account.entity';

export enum PaymentVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string | null = null;

  // ─── RELASI KE PENDAFTARAN ───
  @Column({ type: 'uuid' })
  registrationId: string = '';

  @ManyToOne(() => CompetitionRegistrationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registrationId' })
  registration: CompetitionRegistrationEntity | null = null;

  // ─── RELASI KE REKENING PANITIA ───
  @Column({ type: 'uuid' })
  paymentAccountId: string = '';

  @ManyToOne(() => PaymentAccountEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paymentAccountId' })
  paymentAccount: PaymentAccountEntity | null = null;

  // ─── DETAIL PEMBAYARAN ───
  @Column({ type: 'varchar', length: 100 })
  senderName: string = ''; // Nama pengirim di struk ATM/M-Banking

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number = 0; // Nominal yang ditransfer

  @Column({ type: 'varchar', length: 255 })
  proofUrl: string = ''; // Link ke gambar struk transfer (dari AWS S3/Cloudinary/Local)

  @Column({
    type: 'enum',
    enum: PaymentVerificationStatus,
    default: PaymentVerificationStatus.PENDING,
  })
  status: PaymentVerificationStatus = PaymentVerificationStatus.PENDING;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null = null; // Jika ditolak admin, alasannya ditulis di sini

  @CreateDateColumn()
  uploadedAt: Date | null = null;
}
