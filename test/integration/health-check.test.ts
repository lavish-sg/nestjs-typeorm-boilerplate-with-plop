import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { clearDatabase } from '../../test/utils/database';
import * as request from 'supertest';

const mockVerify = jest.fn();
jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: jest.fn().mockImplementation(() => ({
      verify: mockVerify,
    })),
  },
}));

describe('HealthController', () => {
  let app;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  // for health check
  it('should check health api by returning status code 200', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });

  afterAll(async () => {
    await clearDatabase(app);
    await app.close();
  });
});
