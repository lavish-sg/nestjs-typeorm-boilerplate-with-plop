import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';

describe('UserController', () => {
  let app: INestApplication;
  const userService = {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    getUserRoles: jest.fn(),
    getUserPermissions: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/roles/:id', () => {
    it('should return user roles with valid id', async () => {
      userService.getUserRoles.mockResolvedValue({ roles: [] });
      const response = await request(app.getHttpServer()).get('/users/roles/user-id');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ roles: [] });
    });

    it('should return NotFoundException for invalid id', async () => {
      userService.getUserRoles.mockResolvedValue(null);
      const response = await request(app.getHttpServer()).get('/users/roles/invalid-id');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /users/permissions/:id', () => {
    it('should return user permissions with valid id', async () => {
      userService.getUserPermissions.mockResolvedValue({ permissions: [] });
      const response = await request(app.getHttpServer()).get('/users/permissions/user-id');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ permissions: [] });
    });

    it('should return NotFoundException for invalid id', async () => {
      userService.getUserPermissions.mockResolvedValue(null);
      const response = await request(app.getHttpServer()).get('/users/permissions/invalid-id');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });
});
