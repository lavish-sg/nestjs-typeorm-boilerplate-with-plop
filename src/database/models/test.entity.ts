import { E } from '@faker-js/faker/dist/airline-WjISwexU';
import { Expose } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tests')
export class Test extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', nullable: false, name: 'test_name' })
  testName: string;

  @Expose()
  @Column({ type: 'enum', enum: ['air', 'sea'], default: 'air', name: 'test_method' })
  testMethod: string;

  @Expose()
  @Column({ type: 'varchar', nullable: false, name: 'test_location' })
  testLocation: string;

  // @Column('uuid')
  // jobCodeId: string;

  // @Column({ type: 'timestamptz', nullable: false })
  // poDate: Date;

  @Expose()
  @Column({ type: 'varchar', nullable: true, name: 'test_reason' })
  testReason: string;

  @Expose()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  // date field, boolean, uuid.

  // uuid case for id field.
}
