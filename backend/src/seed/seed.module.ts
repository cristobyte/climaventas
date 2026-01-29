import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SeedController],
})
export class SeedModule {}
