import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateInteractionDto } from './create-interaction.dto';

export class UpdateInteractionDto extends PartialType(
  OmitType(CreateInteractionDto, ['customerId'] as const),
) {}
