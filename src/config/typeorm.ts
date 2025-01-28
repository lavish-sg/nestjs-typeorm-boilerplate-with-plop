import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
// import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
} from './secret';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT, 10),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  entities: ['dist/database/models/**/*.entity.js'],
  synchronize: false,
  logging: true,
  extra: {
    connectionTimeoutMillis: 3000,
  },
  namingStrategy: new SnakeNamingStrategy(),
  migrations: ['dist/database/migrations/*.js'],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
