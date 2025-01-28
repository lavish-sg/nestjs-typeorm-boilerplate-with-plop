import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../src/database/models/user.entity';
import logger from '@src/utils/logger';

export async function clearDatabase(app: INestApplication) {
  const dataSource = app.get(DataSource);

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  const orderedEntities = [User];

  try {
    for (const entity of orderedEntities) {
      const repository = dataSource.getRepository(entity);
      await repository.delete({});
    }

    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    // tslint:disable-next-line: no-console
    logger.error(err);
    throw err;
  } finally {
    await queryRunner.release();
  }
  await dataSource.destroy;
}
