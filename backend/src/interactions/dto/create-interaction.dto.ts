import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsDateString, MinLength } from 'class-validator';
import { InteractionType } from '../../common/constants';

export class CreateInteractionDto {
  @ApiProperty({ description: 'ID del cliente' })
  @IsString({ message: 'El ID del cliente es requerido' })
  customerId: string;

  @ApiProperty({ enum: InteractionType, example: 'CALL', description: 'Tipo de interacción' })
  @IsEnum(InteractionType, { message: 'El tipo de interacción no es válido' })
  type: InteractionType;

  @ApiProperty({ example: 'Llamada de seguimiento', description: 'Asunto' })
  @IsString({ message: 'El asunto es requerido' })
  @MinLength(2, { message: 'El asunto debe tener al menos 2 caracteres' })
  subject: string;

  @ApiPropertyOptional({ description: 'Descripción detallada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Fecha programada' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha programada no es válida' })
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Fecha de completado' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de completado no es válida' })
  completedAt?: string;
}
