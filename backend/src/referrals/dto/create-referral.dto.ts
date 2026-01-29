import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateReferralDto {
  @ApiPropertyOptional({ description: 'ID del cliente que refiere' })
  @IsOptional()
  @IsString()
  referrerCustomerId?: string;

  @ApiProperty({ description: 'ID del cliente referido' })
  @IsString({ message: 'El ID del cliente referido es requerido' })
  referredCustomerId: string;

  @ApiPropertyOptional({ description: 'ID de la alianza' })
  @IsOptional()
  @IsString()
  partnershipId?: string;

  @ApiPropertyOptional({ example: 50000, description: 'Monto del bono' })
  @IsOptional()
  @IsNumber({}, { message: 'El monto del bono debe ser un número' })
  @Min(0, { message: 'El monto del bono no puede ser negativo' })
  bonusAmount?: number;
}
