import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor {
  new (...args: any[]): object;
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        const options = { excludeExtraneousValues: true };

        if (data === null || data === undefined) {
          throw new NotFoundException('Entity not found');
        }

        if (Array.isArray(data)) {
          return data.map((item) => plainToInstance(this.dto, item, options));
        } else {
          return plainToInstance(this.dto, data, options);
        }
      })
    );
  }
}
