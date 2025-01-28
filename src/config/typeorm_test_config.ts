import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Client } from 'pg';
export async function startPostgresContainer() {
  const postgresContainer = await new PostgreSqlContainer()
    .withDatabase('CTL_testdb')
    .withUsername('root')
    .withPassword('root')
    .start();
  const postgresClient = new Client({
    host: postgresContainer.getHost(),
    port: postgresContainer.getMappedPort(5432),
    database: postgresContainer.getDatabase(),
    user: postgresContainer.getUsername(),
    password: postgresContainer.getPassword(),
  });
  await postgresClient.connect();
  const databaseUrl = `postgresql://${postgresClient.user}:${postgresClient.password}@${postgresClient.host}:${postgresClient.port}/${postgresClient.database}`;
  return { container: postgresContainer, databaseUrl };
}

export const config: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/database/models/**/*.entity.ts'],
  synchronize: true,
  extra: {
    connectionTimeoutMillis: 3000,
  },
  namingStrategy: new SnakeNamingStrategy(),
  migrations: ['dist/database/migrations/*.js'],
};
export default registerAs('typeorm_test', () => config);
