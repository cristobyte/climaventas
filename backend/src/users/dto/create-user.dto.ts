import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Role } from '../../common/constants';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@climatecnologia.cl', description: 'Correo electrónico' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'Demo2024!', description: 'Contraseña' })
  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo' })
  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({ example: '+56912345678', description: 'Teléfono' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: Role, example: 'AGENT', description: 'Rol del usuario' })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser AGENT, ANALYTICS o MANAGEMENT' })
  role?: Role;

  @ApiPropertyOptional({ example: 0.05, description: 'Tasa de comisión (0.05 = 5%)' })
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
