import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(function (exception) {
        return throwError(() => mapException(exception));
      })
    );
  }
}

function mapException(exception: unknown) {
  let mappedException: unknown;
  const error = exception as Error;
  if (!error) {
    return exception;
  }

  switch (error.name) {
    // From Cognito responses
    case 'NotAuthorizedException':
      mappedException = new UnauthorizedException();
      break;
    case 'UserInactiveException':
      mappedException = new UserInactiveException();
      break;
    case 'LimitExceededException':
      mappedException = new RateLimitException('rate limit exceeded');
      break;
    case 'BadRequestException':
      mappedException = new FormattedBadRequestException(error.message);
      break;
    default:
      mappedException = exception;
  }

  return mappedException;
}

export class RateLimitException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class UserInactiveException extends HttpException {
  constructor() {
    super(
      'User is inactive, if you think this is an error, please contact someone in the team.',
      HttpStatus.FORBIDDEN
    );
  }
}

export class BooleanSearchFieldException extends HttpException {
  constructor(str: string) {
    super(str, HttpStatus.BAD_REQUEST);
  }
}

export class FormattedBadRequestException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
