import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean, Min, Max, MinLength } from 'class-validator';

export class CreatePartnershipDto {
  @ApiProperty({ example: 'Constructora ABC', description: 'Nombre de la alianza' })
  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre del contacto' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ example: 'contacto@constructora.cl', description: 'Correo electrónico' })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email?: string;

  @ApiPropertyOptional({ example: '+56912345678', description: 'Teléfono' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Constructora', description: 'Tipo de alianza' })
  @IsOptional()
  @IsString()
  partnershipType?: string;

  @ApiPropertyOptional({ example: 0.03, description: 'Tasa de comisión (0.03 = 3%)' })
  @IsOptional()
  @IsNumber({}, { message: 'La tasa de comisión debe ser un número' })
  @Min(0, { message: 'La tasa de comisión no puede ser negativa' })
  @Max(1, { message: 'La tasa de comisión no puede ser mayor a 1' })
  commissionRate?: number;

  @ApiPropertyOptional({ example: true, description: 'Estado activo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
