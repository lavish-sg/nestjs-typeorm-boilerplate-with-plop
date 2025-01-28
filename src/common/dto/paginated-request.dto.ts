import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PagniatedRequestDto<T> {
  @Expose()
  @ApiProperty({ type: Number, example: 1 })
  from: number;

  @Expose()
  @ApiProperty({ type: Number, example: 20 })
  to: number;

  @Expose()
  @ApiProperty({ type: Number, example: 20 })
  perPage: number;

  @Expose()
  @ApiProperty({ type: Number, example: 100 })
  total: number;

  @Expose()
  @ApiProperty({ type: Number, example: 1 })
  currentPage: number;

  @Expose()
  @ApiProperty({ type: Number, example: 1 })
  prevPage?: number | null;

  @Expose()
  @ApiProperty({ type: () => Array<T> })
  @Type(() => Array<T>)
  data: T[];
}
