import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('sandbox_records')
export class SandboxRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  @Index()
  @Column()
  name: string = '';

  @Column('text')
  payload: string = '';

  @Column({ default: false })
  processed: boolean = false;

  @CreateDateColumn()
  createdAt: Date = new Date();
}
