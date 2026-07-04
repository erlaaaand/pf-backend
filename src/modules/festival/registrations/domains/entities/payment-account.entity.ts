import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payment_accounts')
export class PaymentAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string | null = null;

  @Column({ type: 'varchar', length: 50 })
  bankName: string = ''; // Contoh: 'BCA', 'Bank Mandiri', 'DANA'

  @Column({ type: 'varchar', length: 50 })
  accountNumber: string = '';

  @Column({ type: 'varchar', length: 100 })
  accountHolder: string = ''; // Nama pemilik rekening (misal: 'Panitia Physics Fest')

  @Column({ type: 'boolean', default: true })
  isActive: boolean = true; // Admin bisa mematikan rekening tanpa menghapusnya

  @CreateDateColumn()
  createdAt: Date | null = null;

  @UpdateDateColumn()
  updatedAt: Date | null = null;
}
