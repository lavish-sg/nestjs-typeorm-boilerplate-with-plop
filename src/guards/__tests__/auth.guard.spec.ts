import { ExecutionContext, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth.guard';
import { JwtExpiredError, JwtInvalidSignatureError } from 'aws-jwt-verify/error';

const mockVerify = jest.fn();
jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: jest.fn().mockImplementation(() => ({
      verify: mockVerify,
    })),
  },
}));

jest.mock('../../auth/utils/token', () => ({
  extractAccessTokenFromHeaders: jest.fn().mockImplementation(() => 'mocked-access-token'),
  extractAuthIdFromToken: jest.fn().mockImplementation(() => 'mocked-auth-id'),
}));

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let mockExecutionContext: ExecutionContext;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    loggerSpy = jest.spyOn(Logger, 'error').mockImplementation();

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer valid-token' } }),
      }),
    } as ExecutionContext;
  });

  afterEach(() => {
    loggerSpy.mockClear();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('verifyToken should return true for a valid token', async () => {
    mockVerify.mockResolvedValueOnce({});
    const result = await authGuard.canActivate(mockExecutionContext);
    expect(result).toBe(true);
  });

  it('verifyToken should return false for an invalid token', async () => {
    mockVerify.mockRejectedValueOnce(new JwtInvalidSignatureError('Invalid Signature'));
    const result = await authGuard.canActivate(mockExecutionContext);
    expect(result).toBe(false);
  });

  it('should log an error with stack details missing', async () => {
    mockVerify.mockRejectedValueOnce(new JwtInvalidSignatureError('Invalid Signature'));
    await authGuard.canActivate(mockExecutionContext);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Verify token failure for user [mocked-auth-id]: Invalid Signature'),
      undefined,
      'AuthGuard'
    );
  });

  it('should log an error with stack details present', async () => {
    const errorPayload = {
      rawJwt: {
        header: {
          kid: 'fx+mO42CIgWPHQ+XXXXXX',
          alg: 'RS256',
        },
        payload: {
          sub: '7b7f727f-61ca-XXXXXXXX',
          iss: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_XXXXXX',
          client_id: '4l7913mbsdpXXXXXXX',
          origin_jti: '346b5105-7198-4592-ab02-XXXXXX',
          event_id: '39e0d81d-87aa-409e-a341-964ab2636f6e',
          token_use: 'access',
          scope: 'aws.cognito.signin.user.admin',
          auth_time: 1699960187,
          exp: 1699963787,
          iat: 1699960187,
          jti: '17a48168-83c6-4ef7-8ced-XXXXX',
          username: '7b7f727f-61ca-4ff7-bb83-XXXXXXXX',
        },
      },
    };
    mockVerify.mockRejectedValueOnce(new JwtExpiredError('Token Expired', errorPayload));
    await authGuard.canActivate(mockExecutionContext);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Verify token failure for user [mocked-auth-id]: Token Expired'),
      expect.stringContaining(JSON.stringify(errorPayload)),
      'AuthGuard'
    );
  });
});
