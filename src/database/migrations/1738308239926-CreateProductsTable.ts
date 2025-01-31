// 1738308239926-CreateProductsTable.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductsTable1738308239926 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'products',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: `uuid_generate_v4()`,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'price',
                        type: 'decimal',
                        isNullable: true
                    },
                    {
                        name: 'category_id', // Ensure this matches the entity
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        isNullable: false,
                        default: `now()`,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        isNullable: false,
                        default: `now()`,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['category_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'categories',
                        onDelete: 'CASCADE',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('products');
    }
}