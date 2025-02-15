import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTestTable1737614459437 implements MigrationInterface {
  private readonly tableName = 'tests';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'test_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'test_method',
            type: 'enum',
            enum: ['air', 'sea'],
          },
          {
            name: 'test_location',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'test_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
