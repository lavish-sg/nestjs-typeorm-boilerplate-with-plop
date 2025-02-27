const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

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
      {
        type: 'confirm',
        name: 'includeRelations',
        message: 'Do you want to include relation objects in the DTOs?',
        default: true,
        when: (answers) => {
          // Read the entity file
          const modelsDir = path.resolve(process.cwd(), 'src/database/models');
          const entityFilePath = path.join(modelsDir, `${answers.entityName}.entity.ts`);
          const entityFileContent = fs.readFileSync(entityFilePath, 'utf8');

          // Check for any type of relationship decorator with arrow functions
          const relationRegex = /(@ManyToOne|@OneToOne|@OneToMany|@ManyToMany)\s*\(\s*\(\)\s*=>\s*(\w+)/g;
          let match;
          const relations = [];
          
          while ((match = relationRegex.exec(entityFileContent)) !== null) {
            const [_, decorator, entityType] = match;
            const relatedEntityPath = path.join(modelsDir, `${entityType.toLowerCase()}.entity.ts`);
            
            if (fs.existsSync(relatedEntityPath)) {
              relations.push({
                decorator,
                entityType: entityType.toLowerCase(),
                exists: true
              });
              console.log(`Found relation: ${entityType} at ${relatedEntityPath}`);
            } else {
              console.log(`Warning: Related entity ${entityType} not found at ${relatedEntityPath}`);
            }
          }

          answers.relations = relations;
          return relations.length > 0;
        }
      },
      // {
      //   type: 'confirm',
      //   name: 'addAuth',
      //   message: 'Do you want to add authentication to this module?',
      //   default: false,
      // },
    ],

    actions: function (data) {
      console.log('Data received in actions:', {
        moduleName: data.moduleName,
        entityName: data.entityName,
        includeRelations: data.includeRelations,
        relations: data.relations
      });

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
      const commonImports = `import { ApiProperty } from '@nestjs/swagger';
import { 
  IsDefined, 
  IsNotEmpty, 
  IsOptional, 
  IsUUID,
  IsNumber,
  IsDateString,
  IsString,
  IsBoolean,
  IsEnum 
} from 'class-validator';
import { Expose } from 'class-transformer';
`;
      const listDtoImports = `${commonImports}`;

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
              `@Column\\(\\{[^}]*type:\\s*'uuid'[^}]*\\}\\)\\s+${column}:\\s+\\w+;`
            );
            const isUUID = uuidRegex.test(entityFileContent);

            const dateRegex = new RegExp(
              `@Column\\(\\{[^}]*type:\\s*'timestamptz'[^}]*\\}\\)\\s+${column}:\\s+\\w+;`
            );
            const isDate = dateRegex.test(entityFileContent);

            const jsonRegex = new RegExp(
              `@Column\\(\\{[^}]*type:\\s*'jsonb'[^}]*\\}\\)\\s+${column}:\\s+\\w+;`
            );
            const isJson = jsonRegex.test(entityFileContent);

            const arrayRegex = new RegExp(
              `@Column\\(\\{[^}]*type:\\s*'array'[^}]*\\}\\)\\s+${column}:\\s+\\w+;`
            );
            const isArray = arrayRegex.test(entityFileContent);

            if (isEnum) {
              return `  @Expose()\n  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ enum: [${enumValues.map((val) => `'${val}'`).join(', ')}], example: '${enumValues[0]}' })\n  ${column}: '${enumValues.join("' | '")}';\n`;
            }

            if (isNumber) {
              return `  @Expose()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  @ApiProperty({ 
    example: 1,
    type: 'number',
    description: 'Integer value'
  })
  ${column}: number;\n`;
            }

            if (isDecimal) {
              return `  @Expose()
  @IsNotEmpty()
  @IsDefined()
  @IsNumber({ maxDecimalPlaces: 2 })
  @ApiProperty({ 
    example: 1.99,
    type: 'number',
    description: 'Decimal value'
  })
  ${column}: number;\n`;
            }

            if (isBoolean) {
              return `  @Expose()\n  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: true })\n  ${column}: boolean;\n`;
            }

            if (isUUID) {
              return `  @Expose()
  @IsNotEmpty()
  @IsDefined()
  @IsUUID('4')
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID v4 format'
  })
  ${column}: string;\n`;
            }

            if (isDate) {
              return `  @Expose()
  @IsNotEmpty()
  @IsDefined()
  @IsDateString()
  @ApiProperty({ 
    example: '2023-01-01T00:00:00Z',
    description: 'ISO 8601 date format'
  })
  ${column}: Date;\n`;
            }

            if (isJson) {
              return `  @Expose()
  @IsNotEmpty()
  @IsDefined()
  @ApiProperty({ 
    example: { key: 'value' },
    description: 'JSON object'
  })
  ${column}: Record<string, any>;\n`;
            }

            if (isArray) {
              return `  @Expose()
  @IsNotEmpty()
  @IsDefined()
  @ApiProperty({ 
    example: [],
    type: Array,
    description: 'Array of items'
  })
  ${column}: any[];\n`;
            }

            return isNullable
              ? `  @Expose()\n  @IsOptional()\n  @ApiProperty({ example: '${column}', required: false })\n  ${column}?: string;\n`
              : `  @Expose()\n  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: '${column}' })\n  ${column}: string;\n`;
          })
          .join('\n');
      };

      // Generating the actual content for Create, Update, and List DTOs
      const actions = []; // Define actions array here

      const relationsDtoContent = data.includeRelations && data.relations ? 
        data.relations.map(relation => {
          if (relation.exists) {
            const relatedEntityPath = path.join(modelsDir, `${relation.entityType}.entity.ts`);
            const relatedEntityContent = fs.readFileSync(relatedEntityPath, 'utf8');
            
            // Extract columns from related entity
            const relatedColumns = [];
            let relMatch;
            while ((relMatch = columnRegex.exec(relatedEntityContent)) !== null) {
              relatedColumns.push(relMatch[1]);
            }

            // Generate DTO content for this relation
            const dtoContent = generateDtoContent(relatedColumns, relatedEntityContent);
            
            // Create and add the relation DTO
            actions.push({
              type: 'add',
              path: `src/${data.moduleName}/dto/${relation.entityType}.dto.ts`,
              template: `${commonImports}\n\nexport class ${relation.entityType}Dto {\n${dtoContent}\n}`
            });
          }
        }) : null;

      const createDtoContent = generateDtoContent(columns, entityFileContent);
      const updateDtoContent = generateDtoContent(columns, entityFileContent);
      const listDtoContent = generateDtoContent(columns, entityFileContent);

      // Combine imports and DTO content
      let fullListDtoContent = `${listDtoImports}`;
      let fullCreateDtoContent = `${commonImports}`;
      let fullUpdateDtoContent = `${commonImports}`;

      // Add imports for relation DTOs if needed
      if (data.includeRelations && data.relations) {
        const relationImports = data.relations
          .map(relation => `import { ${relation.entityType}Dto } from './${relation.entityType}.dto';`)
          .join('\n');
        
        fullListDtoContent += `${relationImports}\n\n`;
        fullCreateDtoContent += `${relationImports}\n\n`;
        fullUpdateDtoContent += `${relationImports}\n\n`;
      }

      // Add class definitions with main content
      fullListDtoContent += `export class {{pascalCase moduleName}}Dto {\n${listDtoContent}`;
      fullCreateDtoContent += `export class Create{{pascalCase moduleName}}Dto {\n${createDtoContent}`;
      fullUpdateDtoContent += `export class Update{{pascalCase moduleName}}Dto {\n${updateDtoContent}`;

      // Add relation properties if needed
      if (data.includeRelations && data.relations) {
        const relationProperties = data.relations
          .map(relation => `
  @Expose()
  @ApiProperty({ type: ${relation.entityType}Dto })
  ${relation.entityType}: ${relation.entityType}Dto;`)
          .join('\n');

        fullListDtoContent += relationProperties;
        fullCreateDtoContent += relationProperties;
        fullUpdateDtoContent += relationProperties;
      }

      // Close the class definitions
      fullListDtoContent += `\n}`;
      fullCreateDtoContent += `\n}`;
      fullUpdateDtoContent += `\n}`;

      actions.push({
        type: 'add',
        path: 'src/{{moduleName}}/dto/create-{{moduleName}}.dto.ts',
        template: `${fullCreateDtoContent}`,
        // abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path: 'src/{{moduleName}}/dto/update-{{moduleName}}.dto.ts',
        template: `${fullUpdateDtoContent}`,
      });
      actions.push({
        type: 'add',
        path: 'src/{{moduleName}}/dto/{{moduleName}}.dto.ts',
        template: `${fullListDtoContent}`,
      });
      actions.push({
        type: 'add',
        path: 'src/{{moduleName}}/{{moduleName}}.controller.ts',
        templateFile: 'plop-templates/module/controller.hbs',
      });
      actions.push({
        type: 'add',
        path: 'src/{{moduleName}}/{{moduleName}}.service.ts',
        templateFile: 'plop-templates/module/service.hbs',
        data: { 
          entityName: data.entityName,
          relations: data.relations,
          includeRelations: data.includeRelations
        },
      });
      actions.push({
        type: 'add',
        path: 'src/{{moduleName}}/{{moduleName}}.module.ts',
        templateFile: 'plop-templates/module/module.hbs',
        data: { entityName: data.entityName },
      });
      actions.push({
        type: 'add',
        path: 'src/{{moduleName}}/{{moduleName}}.repository.ts',
        templateFile: 'plop-templates/module/repository.hbs',
        data: { entityName: data.entityName },
      });
      actions.push({
        path: 'src/app.module.ts',
        pattern: /(\/\/ MODULE IMPORTS)/g,
        template:
          "import { {{pascalCase moduleName}}Module } from './{{moduleName}}/{{moduleName}}.module';\n$1",
        type: 'modify',
      });
      actions.push({
        path: 'src/app.module.ts',
        pattern: /(\/\/ MODULE EXPORTS)/g,
        template: '{{pascalCase moduleName}}Module,\n    $1',
        type: 'modify',
      });
      actions.push({
        type: 'modify',
        path: 'src/i18n/en/common.json',
        pattern: /(\{)/g,
        template: `$1\n  "{{constantCase moduleName}}_FETCHED_SUCCESSFULLY": "{{sentenceCase moduleName}} fetched successfully!",\n  "{{constantCase moduleName}}_BY_ID_FETCHED_SUCCESSFULLY": "{{sentenceCase moduleName}} by id fetched successfully!",\n  "{{constantCase moduleName}}_CREATED_SUCCESSFULLY": "{{sentenceCase moduleName}} created successfully!",\n  "{{constantCase moduleName}}_UPDATED_SUCCESSFULLY": "{{sentenceCase moduleName}} updated successfully!",\n  "{{constantCase moduleName}}_DELETED_SUCCESSFULLY": "{{sentenceCase moduleName}} deleted successfully!",`,
      });

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
        actions[3].template = `$1\n\n  async handle{{properCase apiName}}(id: string) {\n    try {\n      // Implement your business logic here\n      return { message: 'Data fetched successfully', data: id };\n    } catch (err) {\n      throw new Error(\`Failed to handle {{properCase apiName}}: \${err.message}\`);\n    }\n  }`;
      } else if (data.apiType === 'Post') {
        actions[1].template = `$1\n\n  @${data.apiType}('{{apiName}}')\n  @HttpCode(201)\n  @ApiOperation({ summary: '{{sentenceCase apiName}}' })\n  @ApiResponse({ status: 201, description: '{{properCase apiName}} created successfully.' })\n  @ApiResponse({ status: 400, description: 'Bad Request.' })\n  @ApiResponse({ status: 500, description: 'Internal Server Error.' })\n  async {{camelCase apiName}}(@Body() {{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    return this.{{camelCase moduleName}}Service.handle{{properCase apiName}}({{camelCase apiName}}Dto);\n  }`;
        actions[3].template = `$1\n\n  async handle{{properCase apiName}}({{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    try {\n      // Implement your business logic here\n      return { message: 'Created successfully', data: {{camelCase apiName}}Dto };\n    } catch (err) {\n      throw new Error(\`Failed to handle {{properCase apiName}}: \${err.message}\`);\n    }\n  }`;
      } else if (data.apiType === 'Put' || data.apiType === 'Patch') {
        actions[1].template = `$1\n\n  @${data.apiType}('{{apiName}}')\n  @HttpCode(200)\n  @ApiOperation({ summary: '{{sentenceCase apiName}}' })\n  @ApiResponse({ status: 200, description: '{{properCase apiName}} updated successfully.' })\n  @ApiResponse({ status: 400, description: 'Bad Request.' })\n  @ApiResponse({ status: 404, description: '{{properCase apiName}} not found.' })\n  @ApiResponse({ status: 500, description: 'Internal Server Error.' })\n  async {{camelCase apiName}}(@Param('id', ParseUUIDPipe) id: string, @Body() {{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    return this.{{camelCase moduleName}}Service.handle{{properCase apiName}}(id, {{camelCase apiName}}Dto);\n  }`;
        actions[3].template = `$1\n\n  async handle{{properCase apiName}}(id: string, {{camelCase apiName}}Dto: {{properCase apiName}}Dto) {\n    try {\n      // Implement your business logic here\n      return { message: 'Updated successfully', data: { id, ...{{camelCase apiName}}Dto } };\n    } catch (err) {\n      throw new Error(\`Failed to handle {{properCase apiName}}: \${err.message}\`);\n    }\n  }`;
      } else if (data.apiType === 'Delete') {
        actions[1].template = `$1\n\n  @${data.apiType}('{{apiName}}')\n  @HttpCode(200)\n  @ApiOperation({ summary: '{{sentenceCase apiName}}' })\n  @ApiResponse({ status: 200, description: '{{properCase apiName}} deleted successfully.' })\n  @ApiResponse({ status: 404, description: '{{properCase apiName}} not found.' })\n  @ApiResponse({ status: 500, description: 'Internal Server Error.' })\n  async {{camelCase apiName}}(@Param('id', ParseUUIDPipe) id: string) {\n    return this.{{camelCase moduleName}}Service.handle{{properCase apiName}}(id);\n  }`;
        actions[3].template = `$1\n\n  async handle{{properCase apiName}}(id: string) {\n    try {\n      // Implement your business logic here\n      return { message: 'Deleted successfully', data: id };\n    } catch (err) {\n      throw new Error(\`Failed to handle {{properCase apiName}}: \${err.message}\`);\n    }\n  }`;
      }

      return actions;
    },
  });
  
  // plop.setGenerator("api-module", {
  //   description: "Generate API module from LLD structure",
  //   prompts: [
  //     {
  //       type: "input",
  //       name: "lldPath",
  //       message: "Enter the path to the LLD JSON file:"
  //     }
  //   ],
  //   actions: (data) => {
  //     const fs = require("fs");
  //     const path = require("path");
  //     const lldPath = path.resolve(process.cwd(), data.lldPath);
  //     const lld = JSON.parse(fs.readFileSync(lldPath, "utf8"));
  //     const moduleName = lld.module;
  //     const modulePath = `src/${moduleName}`;

  //     const actions = [];

  //     // Extract unique API methods and their response messages from LLD
  //     const apiMethodMap = {
  //       'GET': 'FETCHED',
  //       'POST': 'ADDED',
  //       'PUT': 'UPDATED',
  //       'PATCH': 'UPDATED',
  //       'DELETE': 'DELETED'
  //     };

  //     // Create a Set to track unique messages
  //     const messageSet = new Set();

  //     lld.endpoints.forEach(endpoint => {
  //       const type = apiMethodMap[endpoint.method];
  //       if (type) {
  //         const key = `${constantCase(moduleName)}_${type}_SUCCESSFULLY`;
  //         const message = endpoint.response.message || `${sentenceCase(moduleName)} ${type.toLowerCase()} successfully`;
          
  //         // Only add if this message hasn't been added before
  //         if (!messageSet.has(key)) {
  //           messageSet.add(key);
  //           actions.push({
  //             type: 'modify',
  //             path: 'src/i18n/en/common.json',
  //             pattern: /(\{)/g,
  //             template: `$1
  //   "${key}": "${message}",`
  //           });
  //         }
  //       }
  //     });

  //     if (fs.existsSync(modulePath)) {
  //       actions.push({
  //         type: "append",
  //         path: `${modulePath}/${moduleName}.controller.ts`,
  //         pattern: /(export class .*Controller {)/g,
  //         templateFile: "plop-templates/dynamic-module/controller.hbs",
  //         data: { lld, type: 'append' }
  //       });

  //       actions.push({
  //         type: "append",
  //         path: `${modulePath}/${moduleName}.service.ts`,
  //         pattern: /(export class .*Service {)/g,
  //         templateFile: "plop-templates/dynamic-module/service.hbs",
  //         data: { lld, type: 'append' }
  //       });
  //     } else {
  //       console.log("Module does not exist, creating new module...");
        
  //       actions.push({
  //         type: "add",
  //         path: `${modulePath}/${moduleName}.controller.ts`,
  //         pattern: /(export class .*Controller {)/g,
  //         templateFile: "plop-templates/dynamic-module/controller.hbs",
  //         data: { lld, type: 'add' }
  //       });

  //       actions.push({
  //         type: "add",
  //         path: `${modulePath}/${moduleName}.service.ts`,
  //         pattern: /(export class .*Service {)/g,
  //         templateFile: "plop-templates/dynamic-module/service.hbs",
  //         data: { lld, type: 'add' }
  //       });

  //       // actions.push({
  //       //   type: 'add',
  //       //   path: `${modulePath}/${moduleName}.module.ts`,
  //       //   templateFile: 'plop-templates/dynamic-module/module.hbs',
  //       //   data: { lld, type: 'add' }
  //       // });

  //       actions.push({
  //         type: 'add',
  //         path: 'src/{{moduleName}}/{{moduleName}}.repository.ts',
  //         templateFile: 'plop-templates/dynamic-module/module.hbs',
  //         data: { moduleName }
  //       });

  //       actions.push({
  //         path: 'src/app.module.ts',
  //         pattern: /(\/\/ MODULE IMPORTS)/g,
  //         template:
  //           "import { {{pascalCase moduleName}}Module } from './{{moduleName}}/{{moduleName}}.module';\n$1",
  //         type: 'modify',
  //       });

  //       actions.push({
  //         path: 'src/app.module.ts',
  //         pattern: /(\/\/ MODULE EXPORTS)/g,
  //         template: '{{pascalCase moduleName}}Module,\n    $1',
  //         type: 'modify',
  //       });
  //     }

  //     return actions;
  //   }
  // });
};
