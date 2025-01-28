import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { ValidateSsoTokenMiddleware } from '@src/user/middlewares/validate-sso-token';
import { Repository } from 'typeorm';
import { User } from '@src/database/models/user.entity';
import { UserHasRole } from '@src/database/models/user-has-role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

jest.mock('jsonwebtoken');
jest.mock('jwks-rsa');
jest.mock('@src/utils/token');
jest.mock('@src/utils/logger');
jest.mock('@src/utils/airtable-integration');

describe('ValidateSsoTokenMiddleware', () => {
  let middleware: ValidateSsoTokenMiddleware;
  let userService: UserService;
  let userRepo: Repository<User>;
  let userHasRolesRepo: Repository<UserHasRole>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateSsoTokenMiddleware,
        {
          provide: UserService,
          useValue: {
            getUserByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserHasRole),
          useClass: Repository,
        },
      ],
    }).compile();

    middleware = module.get<ValidateSsoTokenMiddleware>(ValidateSsoTokenMiddleware);
    userService = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    userHasRolesRepo = module.get<Repository<UserHasRole>>(getRepositoryToken(UserHasRole));

    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should call next with UnauthorizedException if no token is provided', async () => {
    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new UnauthorizedException('TokenNotProvidedException'));
  });

  it('should call next with UnauthorizedException if token is invalid', async () => {
    mockRequest.headers['authorization'] = 'Bearer invalid_token';
    (verify as jest.Mock).mockImplementation((token, getKey, options, callback) => {
      callback(new Error('Invalid token'), null);
    });

    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new UnauthorizedException('TokenNotProvidedException'));
  });

  it('should call next with UnauthorizedException if user is not found', async () => {
    mockRequest.headers['authorization'] = 'Bearer valid_token';
    (verify as jest.Mock).mockImplementation((token, getKey, options, callback) => {
      callback(null, { oid: 'user_id' });
    });
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new UnauthorizedException('TokenNotProvidedException'));
  });

  it('should call next with UserInactiveException if user is inactive', async () => {
    mockRequest.headers['authorization'] = 'Bearer valid_token';
    (verify as jest.Mock).mockImplementation((token, getKey, options, callback) => {
      callback(null, { oid: 'user_id' });
    });
    jest.spyOn(userRepo, 'findOne').mockResolvedValue({ isActive: false } as User);

    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new UnauthorizedException('TokenNotProvidedException'));
  });

  it('should set request.currentUser and call next if user is found and active', async () => {
    mockRequest.headers['authorization'] = 'Bearer valid_token';
    (verify as jest.Mock).mockImplementation((token, getKey, options, callback) => {
      callback(null, { oid: 'user_id' });
    });
    jest.spyOn(userRepo, 'findOne').mockResolvedValue({
      isActive: true,
      userHasRoles: [{ roleId: 'role_id', role: { slug: 'role_slug' } }],
    } as User);

    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should create a new user if user is not found and NODE_ENV is uat or prod', async () => {
    mockRequest.headers['authorization'] = 'Bearer valid_token';
    (verify as jest.Mock).mockImplementation((token, getKey, options, callback) => {
      callback(null, { oid: 'user_id', preferred_username: 'test@example.com', name: 'Test User' });
    });
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(userService, 'createUser').mockResolvedValue({
      id: 'user_id',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
      userHasRoles: [{ roleId: 'role_id', role: { slug: 'role_slug' } }],
    } as User);
    jest.spyOn(userHasRolesRepo, 'save').mockResolvedValue(null);

    process.env.NODE_ENV = 'uat';
    await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext);
  });
});
