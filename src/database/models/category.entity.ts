import { Entity, Column, OneToMany, BaseEntity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { Expose } from 'class-transformer';

@Entity('categories')
export class Category extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Expose()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;
}