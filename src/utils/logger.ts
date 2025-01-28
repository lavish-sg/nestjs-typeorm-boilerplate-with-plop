import { Logger } from '@nestjs/common';
const logger = new Logger();

const error = (message: object) => {
  logger.error(JSON.stringify(message, null, 2), '', 'Error');
};

const warn = (message: object) => {
  logger.warn(JSON.stringify(message, null, 2), 'Warning');
};

const log = (message: object) => {
  logger.log(JSON.stringify(message, null, 2), 'Info');
};

export default {
  error,
  warn,
  log,
};
