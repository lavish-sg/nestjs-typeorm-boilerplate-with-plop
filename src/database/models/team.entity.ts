import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Expose } from 'class-transformer';

@Entity('teams')
export class Team extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: false })
  pocName: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  pocJobRole: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: false })
  pocEmail: string;

  @Expose()
  @Column({ type: 'boolean', default: true })
  isActive: boolean | string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
