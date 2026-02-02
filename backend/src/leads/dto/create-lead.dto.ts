import { IsString, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '../../common/constants';

export class CreateLeadDto {
  @ApiProperty({ description: 'ID del cliente' })
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'Título del lead' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Descripción del lead', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Probabilidad de cierre (0-100)', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  closureChance?: number;

  @ApiProperty({ description: 'Valor estimado', required: false })
  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @ApiProperty({ description: 'Estado del lead', enum: LeadStatus, default: 'NEW' })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: string;

  @ApiProperty({ description: 'Notas', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
