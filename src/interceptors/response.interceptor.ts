import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformationInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(
    private reflector: Reflector,
    private i18n: I18nService
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        message:
          this.i18n.t(
            `common.${this.reflector.get<string>('response_message', context.getHandler())}`
          ) ||
          data.message ||
          '',
        statusCode: context.switchToHttp().getResponse().statusCode,
        data: data?.result || data,
      }))
    );
  }
}
