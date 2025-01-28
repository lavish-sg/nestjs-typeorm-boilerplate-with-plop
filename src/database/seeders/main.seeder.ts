import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { connectionSource } from '../../config/typeorm';
import logger from '../../utils/logger';

export class MainDatabaseSeeder {
  private dbConnection: DataSource;

  constructor() {
    this.initCron();
  }

  private async initDatabaseConnection(): Promise<void> {
    try {
      const conn = await connectionSource.initialize();
      logger.log({
        message: `Data Source initialized successfully`,
        databaseDetails: {
          type: conn.options.type,
          database: conn.options.database,
        },
      });
    } catch (err) {
      logger.error({
        message: `Error during Data Source initialization`,
        data: { err },
      });
      throw err;
    }
  }

  public async initCron() {
    await this.initDatabaseConnection();
    const queryRunner = connectionSource.createQueryRunner();
    await queryRunner.startTransaction();
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
      logger.log({ message: 'DB Seeders started' });
      // Add seeders here
      logger.log({ message: 'DB Seeders executed successfully' });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error({
        message: 'Error during DB seeding',
        error: error.message,
        stack: error.stack,
      });
    } finally {
      await queryRunner.release();
      await app.close();
      process.exit(0);
    }
  }
}

export default new MainDatabaseSeeder();
