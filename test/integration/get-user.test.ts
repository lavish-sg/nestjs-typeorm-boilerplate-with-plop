import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserService } from '../../src/user/user.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let authEmail: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);

    userService = moduleFixture.get<UserService>(UserService);
    const user = await userService.createTestUser();
    authEmail = user.email;
  });

  it('should fetch user list with valid page and size', async () => {
    const response = await request(app.getHttpServer())
      .get('/users?page=1&size=12')
      .set('Authorization', `Bearer ${authEmail}`)
      .set('accept', '*/*')
      .expect(200);

    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body).toHaveProperty('message', 'Users list fetched successfully');
    expect(Array.isArray(response.body.data.users)).toBe(true);
    expect(response.body.data.users.length).toBeGreaterThan(0);
    expect(response.body.data).toHaveProperty('count');
  });
  afterAll(async () => {
    await app.close();
  });
});
