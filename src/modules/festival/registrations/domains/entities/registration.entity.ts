// src/festival/registrations/domains/entities/registration.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { CompetitionEntity } from '../../../competitions/domains/entities/competition.entity';
import { CompetitionWaveEntity } from '../../../competitions/domains/entities/competition-wave.entity';
import { TeamEntity } from '../../../teams/domains/entities/team.entity';
import { UserEntity } from '../../../../identity/users/domains/entities/user.entity';

export enum RegistrationStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum ChampionTitle {
  NONE = 'NONE',
  JUARA_1 = 'JUARA_1',
  JUARA_2 = 'JUARA_2',
  JUARA_3 = 'JUARA_3',
  HONORABLE_MENTION = 'HONORABLE_MENTION',
}

@Entity({ name: 'competition_registrations' })
// Index 1: Mencegah 1 user daftar lomba individu yang sama 2x
@Index('uq_registration_competition_user', ['competitionId', 'userId'], {
  unique: true,
  where: '"userId" IS NOT NULL', // Hanya berlaku jika userId ada isinya
})
// Index 2: Mencegah 1 tim daftar lomba yang sama 2x
@Index('uq_registration_competition_team', ['competitionId', 'teamId'], {
  unique: true,
  where: '"teamId" IS NOT NULL', // Hanya berlaku jika teamId ada isinya
})
export class CompetitionRegistrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // --- INTEGRASI MOOTA ---

  @Column({ type: 'int', default: 0 })
  uniqueCode: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  billingAmount: number = 0;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null = null; // Total yang harus dibayar

  // ─── RELASI KE KOMPETISI ───
  @Column({ type: 'uuid' })
  competitionId: string = '';

  @ManyToOne(() => CompetitionEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'competitionId' })
  competition?: CompetitionEntity;

  // ─── RELASI KE GELOMBANG (WAVE) ───
  @Column({ type: 'uuid', nullable: true })
  waveId: string | null = null;

  @ManyToOne(() => CompetitionWaveEntity, {
    onDelete: 'RESTRICT', // Tidak boleh menghapus wave jika sudah ada pendaftar
    nullable: true,
  })
  @JoinColumn({ name: 'waveId' })
  wave?: CompetitionWaveEntity;

  // ─── RELASI KE PESERTA (UNTUK LOMBA INDIVIDU) ───
  @Column({ type: 'uuid', nullable: true })
  userId: string | null = null;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  // ─── RELASI KE TIM (UNTUK LOMBA BERKELOMPOK) ───
  @Column({ type: 'uuid', nullable: true })
  teamId: string | null = null;

  @ManyToOne(() => TeamEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'teamId' })
  team?: TeamEntity;

  // ─── STATUS & TANGGAL ───
  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING_PAYMENT,
  })
  status: RegistrationStatus = RegistrationStatus.PENDING_PAYMENT;

  @CreateDateColumn()
  registeredAt!: Date;

  @Column({
    type: 'enum',
    enum: ChampionTitle,
    default: ChampionTitle.NONE,
  })
  championTitle: ChampionTitle = ChampionTitle.NONE;
}
