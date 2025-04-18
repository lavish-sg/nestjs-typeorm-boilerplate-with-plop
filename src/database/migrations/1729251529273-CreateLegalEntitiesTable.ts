import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateLegalEntitiesTable1729251529273 implements MigrationInterface {
  private readonly tableName = 'legal_entities';

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
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'client_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'zip_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'city_or_town',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'tax_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: false,
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      this.tableName,
      new TableForeignKey({
        columnNames: ['client_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'clients',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
