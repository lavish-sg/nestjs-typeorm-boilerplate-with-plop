import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const FALLBACK_LANGUAGE = process.env.FALLBACK_LANGUAGE || 'en';
export const LANGUAGE_QUERY_PARAM = process.env.LANGUAGE_QUERY_PARAM || 'lang';
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT || 3000;
export const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,

  AWS_S3_BUCKET_REGION,
  AWS_S3_BUCKET_NAME,
  AWS_CDN_URL,

  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
  POSTGRES_PORT,
  ENABLE_DB_LOGGING,

  MS_CLIENT_ID,
  MS_TENANT_ID,

  SENTRY_DSN,
  API_USERNAME,
  API_PASSWORD,

  // Airtable
  BASE_ID,
  EMPLOYEE_TABLE_ID,
  AIRTABLE_API_KEY,

  CTL_API_BASE_URL,
} = process.env;
