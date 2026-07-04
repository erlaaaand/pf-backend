import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CompetitionWaveEntity } from './competition-wave.entity';

export enum CompetitionParticipantType {
  INDIVIDUAL = 'INDIVIDUAL',
  TEAM = 'TEAM',
}

@Entity({ name: 'competitions' })
export class CompetitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string = '';

  @Column({ type: 'enum', enum: CompetitionParticipantType, nullable: false })
  participantType: CompetitionParticipantType =
    CompetitionParticipantType.INDIVIDUAL;

  @Column({ type: 'tinyint', default: 1 })
  minTeamMembers: number = 1;

  @Column({ type: 'tinyint', default: 1 })
  maxTeamMembers: number = 1;

  @Column({ type: 'text', nullable: true })
  description: string | null = null;

  // Fitur Soft Disable
  @Column({ type: 'boolean', default: true })
  isActive: boolean = true;

  @OneToMany(() => CompetitionWaveEntity, (wave) => wave.competition, {
    cascade: true,
  })
  waves?: CompetitionWaveEntity[];
}
