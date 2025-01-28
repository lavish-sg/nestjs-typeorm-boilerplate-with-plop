import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ResponseMessage } from '@src/decorators/res.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @ApiTags('Health')
  @ResponseMessage('SYSTEM_STATUS')
  check() {
    return this.health.check([() => this.db.pingCheck('database', { timeout: 2000 })]);
  }
}
