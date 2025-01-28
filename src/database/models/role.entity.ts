import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Expose } from 'class-transformer';

@Entity('roles')
export class Role extends BaseEntity {
  @Expose()
  @PrimaryColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  slug: string;
}
