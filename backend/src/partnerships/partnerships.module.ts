import { Module } from '@nestjs/common';
import { PartnershipsService } from './partnerships.service';
import { PartnershipsController } from './partnerships.controller';

@Module({
  providers: [PartnershipsService],
  controllers: [PartnershipsController],
  exports: [PartnershipsService],
})
export class PartnershipsModule {}
