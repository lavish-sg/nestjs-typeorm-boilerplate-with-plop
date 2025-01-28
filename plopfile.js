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

            if (isNumber) {
              return `  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: 1 })\n  ${column}: number;\n`;
            }

            if (isBoolean) {
              return `  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: true })\n  ${column}: boolean;\n`;
            }

            if (isUUID) {
              return `  @IsNotEmpty()\n  @IsDefined()\n  @ApiProperty({ example: 'uuid' })\n  ${column}: string;\n`;
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
};
