import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { MS_CLIENT_ID, MS_TENANT_ID } from '@src/config/secret';

export function extractAuthIdFromHeaders(headers: object): string | null {
  const token = extractAccessTokenFromHeaders(headers);
  return token || null;
}

export function extractAccessTokenFromHeaders(headers: object): string | null {
  const bearerToken = (headers['authorization'] as string) || '';
  return bearerToken.replace('Bearer ', '');
}

export const ssoOptions: jwt.VerifyOptions = {
  audience: MS_CLIENT_ID,
  issuer: `https://login.microsoftonline.com/${MS_TENANT_ID}/v2.0`,
  algorithms: ['RS256'],
};

export const clientOptions: jwksClient.Options = {
  cache: true,
  cacheMaxEntries: 30, // Ensure this is defined
  cacheMaxAge: 600000, // Example cache max age (in milliseconds)
  jwksUri: `https://login.microsoftonline.com/${MS_TENANT_ID}/discovery/v2.0/keys`,
};
