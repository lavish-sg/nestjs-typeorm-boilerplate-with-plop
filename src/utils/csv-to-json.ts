import logger from '@src/utils/logger';

export async function CsvFileToJson(file: Express.Multer.File): Promise<any> {
  try {
    logger.log({
      msg: 'Converting csv file to json',
      eventCode: 'CTL-CSV-TO-JSON-MF-001',
      data: file.buffer,
    });
    return 0;
  } catch (error) {
    logger.error({
      msg: 'Error converting csv file to json',
      eventCode: 'CTL-CSV-TO-JSON-AF-001',
      data: error,
    });
    throw error;
  }
}
