import { Module } from '@nestjs/common';
import { LegalEntitiesController } from './legal-entity.controller';
import { LegalEntityService } from './legal-entity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalEntity } from '@src/database/models/legal-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LegalEntity])],
  controllers: [LegalEntitiesController],
  providers: [LegalEntityService],
  exports: [LegalEntityService],
})
export class LegalEntityModule {}
