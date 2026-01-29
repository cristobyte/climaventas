import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class ConvertReferralDto {
  @ApiPropertyOptional({ example: 50000, description: 'Monto del bono al convertir' })
  @IsOptional()
  @IsNumber({}, { message: 'El monto del bono debe ser un número' })
  @Min(0, { message: 'El monto del bono no puede ser negativo' })
  bonusAmount?: number;
}
