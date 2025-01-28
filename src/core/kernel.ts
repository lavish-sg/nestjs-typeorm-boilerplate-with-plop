import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import * as Sentry from '@sentry/node';
import { API_PASSWORD, API_USERNAME, NODE_ENV, PORT, SENTRY_DSN } from '@src/config/secret';
import { pagination } from '@src/pagination';

export class Kernel {
  private app: INestApplication;
  private configService: ConfigService;
  constructor(app: INestApplication) {
    this.app = app;
    this.configService = app.get(ConfigService);
  }

  public addCommonMiddleware(): void {
    const corsOptions = {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      allowedHeaders: '*',
      exposedHeaders: '*',
      optionsSuccessStatus: 200,
    };
    this.app.enableCors(corsOptions);
  }
  public setupSentry(): void {
    if (SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        tracesSampleRate: 0.0,
      });
    }
  }
  public async setupVersioning(): Promise<void> {
    this.app.enableVersioning({
      type: VersioningType.URI,
    });
  }
  public setupSwagger() {
    const SWAGGER_ENVS = ['local', 'dev', 'qa', 'uat'];
    if (SWAGGER_ENVS.includes(NODE_ENV)) {
      const apiPath = 'api';
      const apiUsername = API_USERNAME;
      const apiPass = API_PASSWORD;

      this.app.use(
        `/${apiPath}*`,
        basicAuth({
          challenge: true,
          users: { [apiUsername]: apiPass },
        })
      );

      const config = new DocumentBuilder()
        .setTitle('API Documentation for CTL Backend')
        .setDescription('API description')
        .addBearerAuth()
        // TODO: Get version from package.json
        .setVersion('0.0.1')
        .build();
      const document = SwaggerModule.createDocument(this.app, config);

      SwaggerModule.setup(apiPath, this.app, document, {
        jsonDocumentUrl: '/openapi.json',
        yamlDocumentUrl: 'openapi.yaml',
      });
    }
  }

  public databasePagination(): void {
    this.app.use(pagination);
  }
  public async startApp(): Promise<void> {
    await this.app.listen(PORT);
  }
}
