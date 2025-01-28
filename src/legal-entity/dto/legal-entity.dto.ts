import { IsUUID, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLegalEntityDto {
  @ApiProperty({
    example: 'e5a1c3ba-6475-47f7-b354-2422e8c4f5fa',
    description: 'UUID of the associated client',
  })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    example: 'ACME Corporation',
    description: 'Name of the legal entity',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '123 Main Street',
    description: 'First line of the address',
    required: false,
  })
  @IsString()
  addressLine1?: string;

  @ApiProperty({
    example: 'Suite 400',
    description: 'Second line of the address',
    required: false,
  })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({
    example: '12345',
    description: 'ZIP code of the address',
    required: false,
  })
  @IsString()
  zipCode?: string;

  @ApiProperty({
    example: 'TAX123456789',
    description: 'Tax identification number',
    required: false,
  })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiProperty({
    example: 'Some additional notes about the entity.',
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: 'United States',
    description: 'Country of the legal entity',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    example: 'New York',
    description: 'City or town of the legal entity',
    required: false,
  })
  @IsString()
  cityOrTown?: string;

  @ApiProperty({
    example: 'New York',
    description: 'State or region of the legal entity',
    required: false,
  })
  @IsString()
  state?: string;
}
