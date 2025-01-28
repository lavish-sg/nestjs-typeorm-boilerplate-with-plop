import { MiddlewareConsumer, Module, RequestMethod, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ExceptionInterceptor } from './interceptors/exception.interceptor';
import { HealthModule } from './health/health.module';
import typeorm from './config/typeorm';
import typeorm_test from './config/typeorm_test_config';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { TransformationInterceptor } from './interceptors/response.interceptor';
import { validationExceptionFactory } from './utils/validation-exception-factory';
import { FALLBACK_LANGUAGE, LANGUAGE_QUERY_PARAM, NODE_ENV } from './config/secret';
import { SentryInterceptor } from './interceptors/sentry.interceptor';
import { UsersFactory } from './database/seeders/factories/users.factory';
import { User } from './database/models/user.entity';
import { SettingsController } from './settings/settings.controller';
import { SettingsModule } from './settings/settings.module';
// import { MainDatabaseSeeder } from './database/seeders/main.seeder';
// MODULE IMPORTS
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: FALLBACK_LANGUAGE,
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: [LANGUAGE_QUERY_PARAM] }, AcceptLanguageResolver],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [NODE_ENV == 'test' ? typeorm_test : typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get(NODE_ENV == 'test' ? 'typeorm_test' : 'typeorm'),
    }),
    HealthModule,
    SettingsModule,
    // MODULE EXPORTS
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    UsersFactory,
    // MainDatabaseSeeder,
    {
      provide: APP_INTERCEPTOR,
      useClass: ExceptionInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        errorHttpStatusCode: 422,
        exceptionFactory: validationExceptionFactory,
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply()
      .forRoutes(
        // UserController,
        // SettingsController,
        // LegalEntitiesController,
      );
  }
}
