import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { AppModule } from '../../src/app.module';

describe('User put API (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let userId: string;
  let authEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    const user = await userService.createTestUser();
    //eslint-disable-next-line
    userId = user.id;
    authEmail = user.email;
  });

  it('should update all user fields successfully', async () => {
    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${authEmail}`)
      .send({
        isActive: true,
        department: 'Engineering',
        team: 'CTL_DEV',
        isLead: false,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'User data updated successfully',
      statusCode: 200,
      data: expect.objectContaining({
        id: userId,
        isActive: true,
        department: 'Engineering',
        team: 'CTL_DEV',
        isLead: false,
      }),
    });
  });

  it('should update only "isActive" field', async () => {
    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({
        isActive: false,
      })
      .set('Authorization', `Bearer ${authEmail}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'User data updated successfully',
      statusCode: 200,
      data: expect.objectContaining({
        id: userId,
        isActive: false,
        email: 'testuser@example.com',
        name: 'Test User',
        department: 'Engineering',
        team: 'CTL_DEV',
        isLead: false,
        jobRole: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    });
  });

  it('should update only "department" field', async () => {
    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({
        department: 'Human Resources',
      })
      .set('Authorization', `Bearer ${authEmail}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'User data updated successfully',
      statusCode: 200,
      data: expect.objectContaining({
        id: userId,
        department: 'Human Resources',
      }),
    });
  });

  it('should update only "team" field', async () => {
    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({
        team: 'DEV_TEAM',
      })
      .set('Authorization', `Bearer ${authEmail}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'User data updated successfully',
      statusCode: 200,
      data: expect.objectContaining({
        id: userId,
        team: 'DEV_TEAM',
      }),
    });
  });

  it('should update only "isLead" field', async () => {
    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({
        isLead: true,
      })
      .set('Authorization', `Bearer ${authEmail}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'User data updated successfully',
      statusCode: 200,
      data: expect.objectContaining({
        id: userId,
        isLead: true,
      }),
    });
  });

  it('should return 422 for invalid "isActive" field', async () => {
    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({
        isActive: 'invalid_boolean',
      })
      .set('Authorization', `Bearer ${authEmail}`);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: 'Validation Error',
      data: expect.any(Object),
    });
  });

  it('should return 422 for invalid "department" field', async () => {
    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({
        department: 12345, // Invalid type (should be string)
      })
      .set('Authorization', `Bearer ${authEmail}`);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: 'Validation Error',
      data: expect.any(Object),
    });
  });

  it('should return 422 for invalid "team" field', async () => {
    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({
        team: true,
      })
      .set('Authorization', `Bearer ${authEmail}`);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: 'Validation Error',
      data: expect.any(Object),
    });
  });

  it('should return 500 for invalid "isLead" field', async () => {
    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send({
        isLead: 'invalid_boolean',
      })
      .set('Authorization', `Bearer ${authEmail}`);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: 'Validation Error',
      data: expect.any(Object),
    });
  });
});
