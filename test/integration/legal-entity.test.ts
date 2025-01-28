import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { LegalEntityService } from '@src/legal-entity/legal-entity.service';
import { ClientService } from '@src/client/client.service';
import { CreateLegalEntityDto } from '../../src/legal-entity/dto/legal-entity.dto';
import { UpdateLegalEntityDto } from '@src/legal-entity/dto/update-legal-entity.dto';

describe('LegalEntitiesController (e2e)', () => {
  let app: INestApplication;
  let legalEntityService: LegalEntityService;
  let clientService: ClientService;
  let legalEntityId: string;
  let clientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    legalEntityService = moduleFixture.get<LegalEntityService>(LegalEntityService);
    clientService = moduleFixture.get<ClientService>(ClientService);

    // Create demo client, check post api for client
    const client = await clientService.addClient({
      name: 'Client A',
      attachmentId: null,
    });
    clientId = client.id;

    // Create demo legal entity, creation of legal entity checks post api
    const createLegalEntityDto: CreateLegalEntityDto = {
      clientId: clientId,
      name: 'Legal Entity A',
      addressLine1: '123 Main Street',
      addressLine2: 'Suite 400',
      zipCode: '12345',
      taxNumber: 'TAX123456789',
      notes: 'Some additional notes about the entity.',
      country: 'United States',
      cityOrTown: 'New York',
      state: 'New York',
    };
    const legalEntity = await legalEntityService.addClient(createLegalEntityDto);
    legalEntityId = legalEntity.id;
  });

  it('should fetch legal entity by ID', async () => {
    const response = await request(app.getHttpServer()).get(`/legal-entities/${legalEntityId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Legal entity fetched successfully',
      data: {
        id: expect.any(String),
        clientId: expect.any(String),
        name: 'Legal Entity A',
        addressLine1: '123 Main Street',
        addressLine2: 'Suite 400',
        cityOrTown: 'New York',
        state: 'New York',
        zipCode: '12345',
        country: 'United States',
        taxNumber: 'TAX123456789',
        notes: 'Some additional notes about the entity.',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });

  it('should update a legal entity', async () => {
    const updateLegalEntityDto: UpdateLegalEntityDto = {
      id: legalEntityId,
      name: 'Updated Legal Entity A',
      addressLine1: '456 Elm Street',
      addressLine2: 'Apt 789',
      zipCode: '67890',
      taxNumber: 'TAX987654321',
      notes: 'Updated notes about the entity.',
      country: 'Canada',
      cityOrTown: 'Toronto',
      state: 'Ontario',
    };

    const response = await request(app.getHttpServer())
      .put(`/legal-entities/${legalEntityId}`)
      .send(updateLegalEntityDto);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Legal entity updated successfully',
      data: expect.objectContaining({
        id: legalEntityId,
        name: 'Updated Legal Entity A',
        addressLine1: '456 Elm Street',
        addressLine2: 'Apt 789',
        cityOrTown: 'Toronto',
        state: 'Ontario',
        zipCode: '67890',
        country: 'Canada',
        taxNumber: 'TAX987654321',
        notes: 'Updated notes about the entity.',
        clientId: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    });
  });

  it('should fetch the updated legal entity by ID', async () => {
    const response = await request(app.getHttpServer()).get(`/legal-entities/${legalEntityId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Legal entity fetched successfully',
      data: {
        id: legalEntityId,
        clientId: clientId,
        name: 'Updated Legal Entity A',
        addressLine1: '456 Elm Street',
        addressLine2: 'Apt 789',
        cityOrTown: 'Toronto',
        state: 'Ontario',
        zipCode: '67890',
        country: 'Canada',
        taxNumber: 'TAX987654321',
        notes: 'Updated notes about the entity.',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
