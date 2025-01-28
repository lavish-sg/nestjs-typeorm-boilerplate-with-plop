import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  InternalServerErrorException,
  Query,
  Put,
  BadRequestException,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@src/decorators/res.decorator';
import { LegalEntityService } from './legal-entity.service';
import { CreateLegalEntityDto } from './dto/legal-entity.dto';
import { UpdateLegalEntityDto } from './dto/update-legal-entity.dto';
import logger from '@src/utils/logger';
import { GetLegalEntityQueryDto } from './dto/get-legal-entity.dto';
import { UserPermissionsGuard } from '@src/guards/verify-permission.guard';

@Controller('legal-entities')
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Legal Entities')
@ApiBearerAuth()
export class LegalEntitiesController {
  constructor(private legalEntityService: LegalEntityService) {}

  @Get()
  @UseGuards(
    new UserPermissionsGuard({
      roles: ['non-billing-team-leads', 'billing-team-leads', 'execs'],
      permissionSlugs: ['clients.view_legal_entity'],
    })
  )
  @ResponseMessage('LEGAL_ENTITIES_LIST_FETCHED')
  @ApiOperation({ summary: 'Legal entities list fetched' })
  @ApiOkResponse({ isArray: true })
  @ApiQuery({ name: 'clientId', required: true, type: String })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'size', required: true, type: Number })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getLegalEntities(@Query() query: GetLegalEntityQueryDto) {
    try {
      const { clientId, sortField, sortOrder, page, size } = query;
      if ((sortField && !sortOrder) || (!sortField && sortOrder)) {
        throw new BadRequestException('Both sortField and sortOrder must be provided together');
      }
      const entities = await this.legalEntityService.getAllLegalEntities(
        page,
        size,
        clientId,
        sortField,
        sortOrder
      );
      return entities;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @UseGuards(
    new UserPermissionsGuard({
      roles: ['execs'],
      permissionSlugs: ['clients.add_legal_entity'],
    })
  )
  @ResponseMessage('LEGAL_ENTITY_CREATED')
  @ApiOperation({ summary: 'Create a new legal entity' })
  @ApiOkResponse({ type: CreateLegalEntityDto })
  async createLegalEntity(@Body() createLegalEntityDto: CreateLegalEntityDto) {
    try {
      const legalEntity = await this.legalEntityService.addClient(createLegalEntityDto);
      return legalEntity;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Put(':id')
  @UseGuards(
    new UserPermissionsGuard({
      roles: ['execs'],
      permissionSlugs: ['clients.edit_legal_entity'],
    })
  )
  @ResponseMessage('LEGAL_ENTITY_UPDATED')
  @ApiOperation({ summary: 'Update legal entity by ID' })
  @ApiOkResponse({ description: 'Legal entity successfully updated' })
  async updateLegalEntity(
    @Param('id') id: string,
    @Body() updateLegalEntityDto: UpdateLegalEntityDto
  ) {
    updateLegalEntityDto.id = id;
    try {
      const updatedEntity = await this.legalEntityService.updateLegalEntity(updateLegalEntityDto);
      return updatedEntity;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  @ResponseMessage('LEGAL_ENTITY_FETCHED')
  @ApiOperation({ summary: 'Fetch legal entity by ID' })
  @ApiOkResponse({ description: 'Legal entity successfully fetched' })
  async getLegalEntityById(@Param('id') id: string) {
    try {
      return this.legalEntityService.getLegalEntityById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logger.error({
        message: `Failed to fetch legal entity with ID ${id}`,
        error,
      });
      throw new InternalServerErrorException();
    }
  }
}
