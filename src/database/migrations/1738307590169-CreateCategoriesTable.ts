import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCategoriesTable1738307590169 implements MigrationInterface {
    private readonly tableName = 'categories';

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
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        isNullable: false,
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        isNullable: false,
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            })
        );


        await queryRunner.query(
            `INSERT INTO ${this.tableName} (id, name, is_active, created_at, updated_at) VALUES ('29debd42-e3d6-49dc-831b-53f971cd47f0', 'Demo Category', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE ${this.tableName}`);
    }
}
