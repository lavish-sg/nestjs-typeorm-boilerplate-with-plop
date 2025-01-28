import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Kernel } from './core/kernel';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const kernel = new Kernel(app);

  kernel.setupVersioning();
  kernel.setupSentry();
  kernel.addCommonMiddleware();
  kernel.setupSwagger();
  kernel.databasePagination();
  await kernel.startApp();
}
bootstrap();
