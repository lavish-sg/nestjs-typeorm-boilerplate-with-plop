import { startPostgresContainer } from '../src/config/typeorm_test_config';

export default async () => {
  const { container, databaseUrl } = await startPostgresContainer();
  global.__POSTGRES_CONTAINER__ = container;
  process.env.DATABASE_URL = databaseUrl;
};
