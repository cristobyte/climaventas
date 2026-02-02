import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateSaleDto {
  @ApiProperty({ description: 'ID del cliente' })
  @IsString({ message: 'El ID del cliente es requerido' })
  customerId: string;

  @ApiProperty({ description: 'ID del producto' })
  @IsString({ message: 'El ID del producto es requerido' })
  productId: string;

  @ApiPropertyOptional({ example: 1, description: 'Cantidad' })
  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity?: number;

  @ApiPropertyOptional({ description: 'Precio unitario (usa el del producto si no se especifica)' })
  @IsOptional()
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  unitPrice?: number;

  @ApiPropertyOptional({ example: 'EFECTIVO', description: 'Método de pago' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Fecha de la venta (default: ahora)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de venta no es válida' })
  saleDate?: string;

  @ApiPropertyOptional({ description: 'ID del lead asociado' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ description: 'URL de la cotización' })
  @IsOptional()
  @IsString()
  quotationUrl?: string;
}
