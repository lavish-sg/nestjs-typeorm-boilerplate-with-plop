import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Expose } from 'class-transformer';
import { LegalEntity } from './legal-entity.entity';
import { Team } from './team.entity';
@Entity('clients')
export class Client extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Expose()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => LegalEntity, (legalEntity) => legalEntity.client)
  legalEntities: LegalEntity[];

  @OneToMany(() => Team, (team) => team.client)
  teams: Team[];
}
