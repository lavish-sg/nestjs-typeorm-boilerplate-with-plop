import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsUUID, IsInt, Min } from 'class-validator';

export class GetLegalEntityQueryDto {
  @IsUUID()
  clientId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Size must be an integer' })
  @Min(1, { message: 'Size must be at least 1' })
  size?: number;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'taxNumber', 'cityOrTown', 'state', 'zipCode', 'country', 'notes'], {
    message:
      'Sort field must be one of: name, taxNumber, cityOrTown, state, zipCode, country, notes',
  })
  sortField?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'Sort order must be either asc or desc',
  })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsUUID()
  jobCodeId: string;
}
