import { IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @IsOptional()
  @Min(1)
  @Transform(({ value }) => Number(value))
  @ApiProperty({
    description: 'Number of items per page',
    required: false,
  })
  perPage: number = 20;

  @IsOptional()
  @Min(1)
  @Transform(({ value }) => Number(value))
  @ApiProperty({
    description: 'Page number',
    required: false,
  })
  page: number = 1;

  @IsOptional()
  @ApiProperty({
    description: 'Get all items',
    required: false,
    type: Boolean,
  })
  getAll: boolean;
}
