import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';
const enableSentry = (err) => {
  let error;
  if (err instanceof InternalServerErrorException) {
    Sentry.captureException(err); // We should have full trace of axios error to debug efficiently
    error = new InternalServerErrorException(err.message);
  } else if (err instanceof BadRequestException) {
    error = new BadRequestException(err.getResponse());
  } else if (err instanceof NotFoundException) {
    error = new NotFoundException(err.getResponse());
  } else if (err instanceof ForbiddenException) {
    error = new ForbiddenException(err.getResponse());
  } else if (err instanceof ConflictException) {
    error = new ConflictException(err.getResponse());
  } else if (err instanceof UnprocessableEntityException) {
    error = new UnprocessableEntityException(err.getResponse());
  } else {
    Sentry.captureException(err);
    error = new InternalServerErrorException(err.message); // We should have full trace of axios error to debug efficiently
  }
  return throwError(() => error);
};
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(catchError(enableSentry));
  }
}
