import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Expose } from 'class-transformer';
import { Client } from './client.entity';

@Entity('legal_entities')
export class LegalEntity extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'uuid' })
  clientId: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  zipCode: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  taxNumber: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  cityOrTown: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  state: string;

  @ManyToOne(() => Client, (client) => client.legalEntities)
  @JoinColumn({ name: 'client_id' })
  client: Client;
}
