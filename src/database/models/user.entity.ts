import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Expose } from 'class-transformer';

@Entity('users')
export class User extends BaseEntity {
  // id for the external authentication system (now AWS Cognito)
  @Expose()
  @PrimaryColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  jobRole: string;

  @Expose()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  department: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  team: string;

  @Expose()
  @Column({ type: 'boolean', default: false })
  isLead: boolean;

}
