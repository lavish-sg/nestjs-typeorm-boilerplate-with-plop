import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';

const moduleName = process.argv[2];

if (!moduleName) {
  logger.error({
    msg: 'Module name is required',
    eventCode: 'CTL-GEN-MOD-001',
    data: { moduleName },
  });
  process.exit(1);
}

const capitalizeFirstLetter = (string: string): string =>
  string.charAt(0).toUpperCase() + string.slice(1);

// Create directory structure and DTO
const dtoPath = path.join('src', moduleName, 'dto');
fs.mkdirSync(dtoPath, { recursive: true });
fs.writeFileSync(
  path.join(dtoPath, `create-${moduleName}.dto.ts`),
  `export class Create${capitalizeFirstLetter(moduleName)}Dto {}`,
  'utf8'
);

// Create Entity
// const entitiesPath = path.join('src', moduleName, 'entities');
// fs.mkdirSync(entitiesPath, { recursive: true });
// fs.writeFileSync(
//   path.join(entitiesPath, `${moduleName}.entity.ts`),
//   `export class ${capitalizeFirstLetter(moduleName)} {}`,
//   'utf8'
// );

// Create Repository
const repositoryPath = path.join('src', moduleName, `${moduleName}.repository.ts`);
const repositoryContent = `import { EntityRepository, Repository } from 'typeorm';
import { ${capitalizeFirstLetter(moduleName)} } from './entities/${moduleName}.entity';

@EntityRepository(${capitalizeFirstLetter(moduleName)})
export class ${capitalizeFirstLetter(moduleName)}Repository extends Repository<${capitalizeFirstLetter(moduleName)}> {}`;
fs.writeFileSync(repositoryPath, repositoryContent, 'utf8');

logger.log({
  msg: 'Generated repository',
  eventCode: 'CTL-GEN-REPO-003',
  data: { repositoryPath, repositoryContent },
});

// Programmatically create the NestJS Module, Controller, and Service files
const moduleFilePath = path.join('src', moduleName, `${moduleName}.module.ts`);
const controllerFilePath = path.join('src', moduleName, `${moduleName}.controller.ts`);
const serviceFilePath = path.join('src', moduleName, `${moduleName}.service.ts`);

const moduleContent = `
import { Module } from '@nestjs/common';
import { ${capitalizeFirstLetter(moduleName)}Service } from './${moduleName}.service';
import { ${capitalizeFirstLetter(moduleName)}Controller } from './${moduleName}.controller';

@Module({
  controllers: [${capitalizeFirstLetter(moduleName)}Controller],
  providers: [${capitalizeFirstLetter(moduleName)}Service],
})
export class ${capitalizeFirstLetter(moduleName)}Module {}
`;

const controllerContent = `
import { Controller, Get } from '@nestjs/common';
import { ${capitalizeFirstLetter(moduleName)}Service } from './${moduleName}.service';

@Controller('${moduleName}')
export class ${capitalizeFirstLetter(moduleName)}Controller {
  constructor(private readonly ${moduleName}Service: ${capitalizeFirstLetter(moduleName)}Service) {}

  @Get()
  findAll() {
    return this.${moduleName}Service.findAll();
  }
}
`;

const serviceContent = `
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${capitalizeFirstLetter(moduleName)}Service {
  findAll() {
    return 'This action returns all ${moduleName}';
  }
}
`;

fs.writeFileSync(moduleFilePath, moduleContent, 'utf8');
fs.writeFileSync(controllerFilePath, controllerContent, 'utf8');
fs.writeFileSync(serviceFilePath, serviceContent, 'utf8');

logger.log({
  msg: 'Generated module, controller, and service',
  eventCode: 'CTL-GEN-MCS-005',
  data: { moduleFilePath, controllerFilePath, serviceFilePath },
});

logger.log({
  msg: `${capitalizeFirstLetter(moduleName)} module generated successfully`,
  eventCode: 'CTL-GEN-MOD-006',
  data: { moduleName },
});
