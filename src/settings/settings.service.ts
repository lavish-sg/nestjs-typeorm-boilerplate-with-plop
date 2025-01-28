import { Injectable } from '@nestjs/common';
import {
  JOB_CODE_BOOLEAN_OPTIONS,
  LOGGED_TIME_BOOLEAN_OPTIONS,
  RATE_CARD_BOOLEAN_OPTIONS,
  USER_BOOLEAN_OPTIONS,
} from '@src/constants/boolean-fields';
import { ROLES } from '@src/constants/role-and-permissions';

@Injectable()
export class SettingsService {
  getInitialSettings() {
    return {
      roles: ROLES,
      // This is a list of fields that can be used in boolean search for users table in admin section
      usersBoolean: Object.keys(USER_BOOLEAN_OPTIONS),
      rateCardBoolean: Object.keys(RATE_CARD_BOOLEAN_OPTIONS),
      jobCodeBoolean: Object.keys(JOB_CODE_BOOLEAN_OPTIONS),
      loggedTimeBoolean: Object.keys(LOGGED_TIME_BOOLEAN_OPTIONS),
    };
  }
}
