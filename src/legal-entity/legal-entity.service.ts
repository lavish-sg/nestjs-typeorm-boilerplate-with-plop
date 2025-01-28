import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalEntity } from '@src/database/models/legal-entity.entity';
import { CreateLegalEntityDto } from './dto/legal-entity.dto';
import { UpdateLegalEntityDto } from './dto/update-legal-entity.dto';

@Injectable()
export class LegalEntityService {
  constructor(
    @InjectRepository(LegalEntity)
    private readonly legalEntityRepository: Repository<LegalEntity>
  ) {}

  async addClient(createLegalEntityDto: CreateLegalEntityDto): Promise<LegalEntity> {
    try {
      const legalEntity = this.legalEntityRepository.create({
        ...createLegalEntityDto,
      });

      const savedLegalEntity = await this.legalEntityRepository.save(legalEntity);
      return savedLegalEntity;
    } catch (err) {
      throw new Error(`Failed to create legal entity: ${err.message}`);
    }
  }

  async getAllLegalEntities(
    page: number = 1,
    size: number = 10,
    clientId: string,
    sortField?: string,
    sortOrder?: string
  ): Promise<{ LegalEntities: LegalEntity[]; count: number }> {
    try {
      let sortDirection = null;
      if (sortOrder) {
        sortDirection = sortOrder.toUpperCase();
      }
      const order = {
        [sortField]: sortDirection,
      };
      const skip = (page - 1) * size;

      const data = await this.legalEntityRepository.findAndCount({
        where: { clientId: clientId },
        skip,
        take: size,
        ...(sortField && sortOrder ? { order } : {}),
      });

      const [LegalEntities, count] = data;
      return { LegalEntities, count };
    } catch (err) {
      throw new Error(`Failed to fetch legal entities: ${err.message}`);
    }
  }

  async updateLegalEntity(updateLegalEntityDto: UpdateLegalEntityDto): Promise<LegalEntity> {
    const { id, ...updateFields } = updateLegalEntityDto;
    if (!Object.values(updateFields).some((value) => value !== undefined)) {
      throw new BadRequestException('At least one field must be provided for update.');
    }
    const legalEntity = await this.legalEntityRepository.findOne({ where: { id } });
    if (!legalEntity) {
      throw new NotFoundException(`Legal entity with ID ${id} not found.`);
    }
    Object.assign(legalEntity, updateFields);

    return await this.legalEntityRepository.save(legalEntity);
  }

  async getLegalEntityById(id: string): Promise<LegalEntity> {
    try {
      const legalEntity = await this.legalEntityRepository.findOne({ where: { id } });
      if (!legalEntity) {
        throw new NotFoundException(`Legal entity with ID ${id} not found.`);
      }
      return legalEntity;
    } catch (err) {
      throw new Error(`Failed to fetch legal entity: ${err.message}`);
    }
  }
}
