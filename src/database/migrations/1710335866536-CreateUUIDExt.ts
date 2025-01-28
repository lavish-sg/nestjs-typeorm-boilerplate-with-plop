import { MigrationInterface, QueryRunner } from 'typeorm';
import { BaseEntity } from '../models/base.entity';
export class CreateUUIDExt1710335866536 extends BaseEntity implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp";`);
  }
}
