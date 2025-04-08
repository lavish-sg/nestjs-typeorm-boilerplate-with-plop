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

  private async verifyToken(token: string): Promise<boolean> {
    try {
      await this.verifier.verify(token);
      return true;
    } catch (error: any) {
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
