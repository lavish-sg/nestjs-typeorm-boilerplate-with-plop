const fs = require('fs');
const path = require('path');

module.exports = function (plop) {
  plop.setGenerator('module', {
    description: 'create a new module',
    prompts: [
      {
        type: 'input',
        name: 'moduleName',
        message: 'module name please',
        validate: function (value) {
          if (/.+/.test(value.trim())) {
            const modulePath = path.resolve(
              process.cwd(),
              'src',
              value.trim().replace(/\s+/g, '-').toLowerCase()
            );
            if (fs.existsSync(modulePath)) {
              return 'module already exists, please enter a different name';
            }
            return true;
          }
          return 'module name is required';
        },
        filter: function (value) {
          return value.trim().replace(/\s+/g, '-').toLowerCase();
        },
      },
      {
        type: 'list',
        name: 'entityName',
        message: 'Select an entity:',
        choices: function () {
          const modelsDir = path.resolve(process.cwd(), 'src/database/models');
          const modelFiles = fs
            .readdirSync(modelsDir)
            .filter((file) => file.endsWith('.entity.ts'));
          return modelFiles.map((file) => ({
            name: file.replace('.entity.ts', ''),
            value: file.replace('.entity.ts', ''),
          }));
        },
      },
      // {
      //   type: 'confirm',
      //   name: 'addAuth',
      //   message: 'Do you want to add authentication to this module?',
      //   default: false,
      // },
    ],

    actions: function (data) {
      const modelsDir = path.resolve(process.cwd(), 'src/database/models');
      const entityFilePath = path.join(modelsDir, `${data.entityName}.entity.ts`);
      const entityFileContent = fs.readFileSync(entityFilePath, 'utf8');

      // Extract columns from the entity file
      const columnRegex = /@Column\(\{[^}]*\}\)\s+(\w+):\s+\w+;/g;
      let match;
      const columns = [];
      while ((match = columnRegex.exec(entityFileContent)) !== null) {
        columns.push(match[1]);
      }

      // Add the necessary imports dynamically for each DTO
      const commonImports = `import { ApiProperty } from '@nestjs/swagger';\nimport { IsDefined, IsNotEmpty, IsOptional } from 'class-validator';\n`;
      const listDtoImports = `${commonImports}import { Expose } from 'class-transformer';\n`;

      // Generate content for Create, Update and List DTOs dynamically
      const generateDtoContent = (columns, entityFileContent) => {
        return columns
          .map((column) => {
            const columnRegex = new RegExp(
              `@Column\\(\\{[^}]*nullable:\\s*(true|false)[^}]*\\}\\)\\s+${column}:\\s+\\w+;`
            );
            const columnMatch = columnRegex.exec(entityFileContent);
            const isNullable = columnMatch && columnMatch[1] === 'true';

            const enumRegex = new RegExp(
              `@Column\\(\\{[^}]*type:\\s*'enum',\\s*enum:\\s*\\[([^\\]]+)\\][^}]*\\}\\)\\s+${column}:\\s+\\w+;`
            );
            const enumMatch = enumRegex.exec(entityFileContent);
            const isEnum = !!enumMatch;
            const enumValues = isEnum
              ? enumMatch[1].split(',').map((val) => val.trim().replace(/'/g, ''))
              : [];

            const booleanRegex = new RegExp(
              `@Column\\(\\{[^}]*type:\\s*'boolean'[^}]*\\}\\)\\s+${column}:\\s+\\w+(\\s*\\|\\s*\\w+)*;`
            );
            const isBoolean = booleanRegex.test(entityFileContent);

            const numberRegex = new RegExp(
              `@Column\\(\\{[^}]*type:\\s*'int'[^}]*\\}\\)\\s+${column}:\\s+\\w+;`
            );
            const isNumber = numberRegex.test(entityFileContent);

            const decimalRegex = new RegExp(
              `@Column\\(\\{[^}]*type:\\s*'decimal'[^}]*\\}\\)\\s+${column}:\\s+\\w+;`
            );
            const isDecimal = decimalRegex.test(entityFileContent);

            const uuidRegex = new RegExp(
              `@Column\\(\\s*'uuid'\\s*\\)\\s+${column}:\\s+\\w+;`
            );
            const isUUID = uuidRegex.test(entityFileContent);

            const dateRegex = new RegExp(
              `@Column\\(\\{[^}]*type:\\s*'timestamptz'[^}]*\\}\\)\\s+${column}:\\s+\\w+;`
            );
            const isDate = dateRegex.test(entityFileContent);

            if (isEnum) {
              return `  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ enum: [${enumValues.map((val) => `'${val}'`).join(', ')}], example: '${enumValues[0]}' })\n  ${column}: '${enumValues.join("' | '")}';\n`;
            }

            if (isNumber || isDecimal) {
              return `  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: 1 })\n  ${column}: number;\n`;
            }

            if (isBoolean) {
              return `  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: true })\n  ${column}: boolean;\n`;
            }

            if (isUUID) {
              return `  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: '29debd42-e3d6-49dc-831b-53f971cd47f0' })\n  ${column}: string;\n`;
            }

            if (isDate) {
              return `  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: '2023-01-01T00:00:00Z' })\n  ${column}: Date;\n`;
            }

            return isNullable
              ? `  @IsOptional()\n  @ApiProperty({ example: '${column}', required: false })\n  ${column}?: string;\n`
              : `  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: '${column}' })\n  ${column}: string;\n`;
          })
          .join('\n');
      };

      // Generating the actual content for Create, Update, and List DTOs
      const createDtoContent = generateDtoContent(columns, entityFileContent);
      const updateDtoContent = generateDtoContent(columns, entityFileContent);
      const listDtoContent = generateDtoContent(columns, entityFileContent);

      // Combine imports and DTO content
      const fullListDtoContent = `${listDtoImports}\nexport class {{pascalCase moduleName}}Dto {\n${listDtoContent}\n}`;
      const fullCreateDtoContent = `${commonImports}\nexport class Create{{pascalCase moduleName}}Dto {\n${createDtoContent}\n}`;
      const fullUpdateDtoContent = `${commonImports}\nexport class Update{{pascalCase moduleName}}Dto {\n${updateDtoContent}\n}`;

      const actions = [
        {
          type: 'add',
          path: 'src/{{moduleName}}/dto/create-{{moduleName}}.dto.ts',
          template: `${fullCreateDtoContent}`,
          // abortOnFail: true,
        },
        {
          type: 'add',
          path: 'src/{{moduleName}}/dto/update-{{moduleName}}.dto.ts',
          template: `${fullUpdateDtoContent}`,
        },
        {
          type: 'add',
          path: 'src/{{moduleName}}/dto/{{moduleName}}.dto.ts',
          template: `${fullListDtoContent}`,
        },
        {
          type: 'add',
          path: 'src/{{moduleName}}/{{moduleName}}.controller.ts',
          templateFile: 'plop-templates/module/controller.hbs',
        },
        {
          type: 'add',
          path: 'src/{{moduleName}}/{{moduleName}}.service.ts',
          templateFile: 'plop-templates/module/service.hbs',
          data: { entityName: data.entityName },
        },
        {
          type: 'add',
          path: 'src/{{moduleName}}/{{moduleName}}.module.ts',
          templateFile: 'plop-templates/module/module.hbs',
          data: { entityName: data.entityName },
        },
        {
          type: 'add',
          path: 'src/{{moduleName}}/{{moduleName}}.repository.ts',
          templateFile: 'plop-templates/module/repository.hbs',
          data: { entityName: data.entityName },
        },
        {
          path: 'src/app.module.ts',
          pattern: /(\/\/ MODULE IMPORTS)/g,
          template:
            "import { {{pascalCase moduleName}}Module } from './{{moduleName}}/{{moduleName}}.module';\n$1",
          type: 'modify',
        },
        {
          path: 'src/app.module.ts',
          pattern: /(\/\/ MODULE EXPORTS)/g,
          template: '{{pascalCase moduleName}}Module,\n    $1',
          type: 'modify',
        },
        {
          type: 'modify',
          path: 'src/i18n/en/common.json',
          pattern: /(\{)/g,
          template: `$1\n  "{{constantCase moduleName}}_FETCHED_SUCCESSFULLY": "{{sentenceCase moduleName}} fetched successfully!",\n  "{{constantCase moduleName}}_BY_ID_FETCHED_SUCCESSFULLY": "{{sentenceCase moduleName}} by id fetched successfully!",\n  "{{constantCase moduleName}}_CREATED_SUCCESSFULLY": "{{sentenceCase moduleName}} created successfully!",\n  "{{constantCase moduleName}}_UPDATED_SUCCESSFULLY": "{{sentenceCase moduleName}} updated successfully!",\n  "{{constantCase moduleName}}_DELETED_SUCCESSFULLY": "{{sentenceCase moduleName}} deleted successfully!",`,
        },
      ];

      // if (data.addAuth) {
      //   actions.push({
      //     path: 'src/app.module.ts',
      //     pattern: /(\/\/ MODULE EXPORTS)/g,
      //     template: '{{pascalCase moduleName}}Module,\n    $1',
      //     type: 'modify',
      //   });
      // }

      return actions;
    },
  });

  plop.setGenerator('api', {
    description: 'create a new API endpoint in an existing module',
    prompts: [
      {
        type: 'list',
        name: 'moduleName',
        message: 'Select a module:',
        choices: function () {
          const appModulePath = path.resolve(process.cwd(), 'src/app.module.ts');
          const appModuleContent = fs.readFileSync(appModulePath, 'utf8');
          const moduleRegex = /import { (\w+)Module } from '\.\/(\w+)\/\2\.module';/g;
          const modules = [];
          let match;
          while ((match = moduleRegex.exec(appModuleContent)) !== null) {
            modules.push(match[2]);
          }
          return modules;
        },
      },
      {
        type: 'input',
        name: 'apiName',
        message: 'API name please',
        validate: function (value) {
          if (/.+/.test(value.trim())) {
            return true;
          }
          return 'API name is required';
        },
      },
      {
        type: 'list',
        name: 'apiType',
        message: 'Select the API type:',
        choices: ['Get', 'Post', 'Put', 'Delete', 'Patch'],
      },
    ],
    actions: function (data) {
      const apiMethod = data.apiType.toLowerCase();
      const actions = [
        {
          type: 'modify',
          path: 'src/{{moduleName}}/{{moduleName}}.controller.ts',
          pattern: /(import { .* } from '@nestjs\/common';)/g,
          template: `$1\nimport { {{properCase apiName}}Dto } from './dto/{{apiName}}.dto';`,
        },
        {
          type: 'modify',
          path: 'src/{{moduleName}}/{{moduleName}}.controller.ts',
          pattern: /(export class .*Controller {)/g,
          template: `$1\n\n  @${data.apiType}('{{apiName}}')\n  async {{camelCase apiName}}(@Body() {{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    return this.{{camelCase moduleName}}Service.handle{{properCase apiName}}({{camelCase apiName}}Dto);\n  }`,
        },
        {
          type: 'modify',
          path: 'src/{{moduleName}}/{{moduleName}}.service.ts',
          pattern: /(import { Injectable } from '@nestjs\/common';)/g,
          template: `$1\nimport { {{properCase apiName}}Dto } from './dto/{{apiName}}.dto';`,
        },
        {
          type: 'modify',
          path: 'src/{{moduleName}}/{{moduleName}}.service.ts',
          pattern: /(export class .*Service {)/g,
          template: `$1\n\n  async handle{{properCase apiName}}({{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    try {\n      // Implement your business logic here\n      return { message: '{{properCase apiName}} handled successfully', data: {{camelCase apiName}}Dto };\n    } catch (err) {\n      throw new Error(\`Failed to handle {{properCase apiName}}: \${err.message}\`);\n    }\n  }`,
        },
      ];

      if (data.apiType === 'Get') {
        actions[1].template = `$1\n\n  @${data.apiType}('{{apiName}}')\n  @HttpCode(200)\n  @ApiOperation({ summary: '{{sentenceCase apiName}}' })\n  @ApiResponse({ status: 200, description: '{{properCase apiName}} fetched successfully.' })\n  @ApiResponse({ status: 404, description: '{{properCase apiName}} not found.' })\n  @ApiResponse({ status: 500, description: 'Internal Server Error.' })\n  async {{camelCase apiName}}(@Param('id', ParseUUIDPipe) id: string) {\n    return this.{{camelCase moduleName}}Service.handle{{properCase apiName}}(id);\n  }`;
        actions[3].template = `$1\n\n  async handle{{properCase apiName}}(id: string) {\n    try {\n      // Implement your business logic here\n      return { message: '{{properCase apiName}} fetched successfully', data: id };\n    } catch (err) {\n      throw new Error(\`Failed to handle {{properCase apiName}}: \${err.message}\`);\n    }\n  }`;
      } else if (data.apiType === 'Post') {
        actions[1].template = `$1\n\n  @${data.apiType}('{{apiName}}')\n  @HttpCode(201)\n  @ApiOperation({ summary: '{{sentenceCase apiName}}' })\n  @ApiResponse({ status: 201, description: '{{properCase apiName}} created successfully.' })\n  @ApiResponse({ status: 400, description: 'Bad Request.' })\n  @ApiResponse({ status: 500, description: 'Internal Server Error.' })\n  async {{camelCase apiName}}(@Body() {{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    return this.{{camelCase moduleName}}Service.handle{{properCase apiName}}({{camelCase apiName}}Dto);\n  }`;
        actions[3].template = `$1\n\n  async handle{{properCase apiName}}({{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    try {\n      // Implement your business logic here\n      return { message: '{{properCase apiName}} created successfully', data: {{camelCase apiName}}Dto };\n    } catch (err) {\n      throw new Error(\`Failed to handle {{properCase apiName}}: \${err.message}\`);\n    }\n  }`;
      } else if (data.apiType === 'Put' || data.apiType === 'Patch') {
        actions[1].template = `$1\n\n  @${data.apiType}('{{apiName}}')\n  @HttpCode(200)\n  @ApiOperation({ summary: '{{sentenceCase apiName}}' })\n  @ApiResponse({ status: 200, description: '{{properCase apiName}} updated successfully.' })\n  @ApiResponse({ status: 400, description: 'Bad Request.' })\n  @ApiResponse({ status: 404, description: '{{properCase apiName}} not found.' })\n  @ApiResponse({ status: 500, description: 'Internal Server Error.' })\n  async {{camelCase apiName}}(@Param('id', ParseUUIDPipe) id: string, @Body() {{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    return this.{{camelCase moduleName}}Service.handle{{properCase apiName}}(id, {{camelCase apiName}}Dto);\n  }`;
        actions[3].template = `$1\n\n  async handle{{properCase apiName}}(id: string, {{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    try {\n      // Implement your business logic here\n      return { message: '{{properCase apiName}} updated successfully', data: { id, ...{{camelCase apiName}}Dto } };\n    } catch (err) {\n      throw new Error(\`Failed to handle {{properCase apiName}}: \${err.message}\`);\n    }\n  }`;
      } else if (data.apiType === 'Delete') {
        actions[1].template = `$1\n\n  @${data.apiType}('{{apiName}}')\n  @HttpCode(200)\n  @ApiOperation({ summary: '{{sentenceCase apiName}}' })\n  @ApiResponse({ status: 200, description: '{{properCase apiName}} deleted successfully.' })\n  @ApiResponse({ status: 404, description: '{{properCase apiName}} not found.' })\n  @ApiResponse({ status: 500, description: 'Internal Server Error.' })\n  async {{camelCase apiName}}(@Param('id', ParseUUIDPipe) id: string) {\n    return this.{{camelCase moduleName}}Service.handle{{properCase apiName}}(id);\n  }`;
        actions[3].template = `$1\n\n  async handle{{properCase apiName}}(id: string) {\n    try {\n      // Implement your business logic here\n      return { message: '{{properCase apiName}} deleted successfully', data: id };\n    } catch (err) {\n      throw new Error(\`Failed to handle {{properCase apiName}}: \${err.message}\`);\n    }\n  }`;
      }

      return actions;
    },
  });
};
