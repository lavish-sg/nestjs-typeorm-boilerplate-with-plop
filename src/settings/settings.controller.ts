import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@src/decorators/res.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiTags('Settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get static permission list' })
  @ApiOkResponse({ isArray: true })
  @ResponseMessage('PERMISSION_LIST_FETCHED')
  getInitialSettings() {
    return this.settingsService.getInitialSettings();
  }
}
