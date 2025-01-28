import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  CognitoJwtVerifierProperties,
  CognitoJwtVerifierSingleUserPool,
} from 'aws-jwt-verify/cognito-verifier';

@Injectable()
export class AuthGuard implements CanActivate {
  private verifier: CognitoJwtVerifierSingleUserPool<CognitoJwtVerifierProperties>;

  constructor() {}

  canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const token = request.user.token; // get token from header
      return this.verifyToken(token);
    } catch (error) {
      Logger.error(`Error occurred verifying token: ${error}`);
      return false;
    }
  }

  // TODO - https://github.com/awslabs/aws-jwt-verify#checking-scope can be used for authorisation too
  // Performs 3 stages of validation:
  //    https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html#amazon-cognito-user-pools-using-tokens-aws-jwt-verify
  // Stage 1: Verify JWT structure and JSON parse the JWT
  // Stage 2: Verify JWT cryptographic signature (i.e. RS256/RS384/RS512)
  // Stage 3: Verify JWT claims (such as e.g. its expiration)
  //
  // The library downloads the JWKS from the JWKS URI (≈200ms) on the initial call and caches it thereafter.
  // Subsequent verifications take ≈1ms.
  private async verifyToken(token: string): Promise<boolean> {
    try {
      await this.verifier.verify(token);
      return true;
    } catch (error: any) {
      // Stage 3 errors contain the raw JWT, which can be useful for troubleshooting
      // https://github.com/awslabs/aws-jwt-verify#peek-inside-invalid-jwts
      const authId = 'token';
      const stringifiedError = JSON.stringify(error);
      const stack = stringifiedError && stringifiedError !== '{}' ? stringifiedError : undefined;
      Logger.error(
        `Verify token failure for user [${authId}]: ${error.message}`,
        stack,
        'AuthGuard'
      );
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
  }
}
