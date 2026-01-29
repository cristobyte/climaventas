import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
import { CustomerStage, CustomerSource } from '../../common/constants';

export class CreateCustomerDto {
  @ApiProperty({ example: 'María González', description: 'Nombre del cliente' })
  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({ example: 'maria@example.com', description: 'Correo electrónico' })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email?: string;

  @ApiPropertyOptional({ example: '+56912345678', description: 'Teléfono' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Providencia 1234', description: 'Dirección' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Santiago', description: 'Ciudad' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Metropolitana', description: 'Región' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    enum: CustomerStage,
    example: 'PROSPECTING',
    description: 'Etapa del ciclo de vida',
  })
  @IsOptional()
  @IsEnum(CustomerStage, { message: 'La etapa no es válida' })
  stage?: CustomerStage;

  @ApiPropertyOptional({
    enum: CustomerSource,
    example: 'WEBSITE',
    description: 'Fuente de adquisición',
  })
  @IsOptional()
  @IsEnum(CustomerSource, { message: 'La fuente no es válida' })
  source?: CustomerSource;

  @ApiPropertyOptional({ description: 'ID del agente asignado' })
  @IsOptional()
  @IsString()
  assignedAgentId?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}
