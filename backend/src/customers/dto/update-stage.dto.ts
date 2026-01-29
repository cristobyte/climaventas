import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CustomerStage } from '../../common/constants';

export class UpdateStageDto {
  @ApiProperty({
    enum: CustomerStage,
    example: 'SALES',
    description: 'Nueva etapa del ciclo de vida',
  })
  @IsEnum(CustomerStage, { message: 'La etapa no es válida' })
  stage: CustomerStage;
}
