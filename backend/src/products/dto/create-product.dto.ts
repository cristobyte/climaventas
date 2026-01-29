import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, MinLength } from 'class-validator';
import { ProductCategory } from '../../common/constants';

export class CreateProductDto {
  @ApiProperty({ example: 'Split 12000 BTU Inverter', description: 'Nombre del producto' })
  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({ description: 'Descripción del producto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Samsung', description: 'Marca' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'AR12TXHQASINPE', description: 'Modelo' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 449990, description: 'Precio en pesos' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @ApiPropertyOptional({ example: 0.08, description: 'Porcentaje de comisión (0.08 = 8%)' })
  @IsOptional()
  @IsNumber({}, { message: 'El porcentaje de comisión debe ser un número' })
  @Min(0, { message: 'El porcentaje de comisión no puede ser negativo' })
  commissionPercentage?: number;

  @ApiProperty({ enum: ProductCategory, example: 'SPLIT', description: 'Categoría' })
  @IsEnum(ProductCategory, { message: 'La categoría no es válida' })
  category: ProductCategory;

  @ApiPropertyOptional({ example: true, description: 'Estado activo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
