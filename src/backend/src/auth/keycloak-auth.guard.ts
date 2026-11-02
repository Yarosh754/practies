import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createPublicKey, type JsonWebKey, type KeyObject } from 'node:crypto';
import { decode, verify } from 'jsonwebtoken';
import type { Request } from 'express';
import type { AuthUser, KeycloakJwtPayload } from './auth.types';

interface Jwk extends JsonWebKey {
  kid?: string;
}

interface JwksResponse {
  keys?: Jwk[];
}

const REALM = process.env.KEYCLOAK_REALM ?? 'practics';
const INTERNAL_URL = process.env.KEYCLOAK_INTERNAL_URL ?? 'http://localhost:9200';
const EXTERNAL_URL = process.env.KEYCLOAK_EXTERNAL_URL ?? INTERNAL_URL;
const ISSUERS: [string, ...string[]] = [
  `${EXTERNAL_URL}/realms/${REALM}`,
  `${INTERNAL_URL}/realms/${REALM}`,
];
const JWKS_URL = `${INTERNAL_URL}/realms/${REALM}/protocol/openid-connect/certs`;
const CACHE_TTL_MS = 10 * 60 * 1000;

let cache: { keys: Map<string, KeyObject>; fetchedAt: number } | null = null;

async function fetchKeys(): Promise<Map<string, KeyObject>> {
  const response = await fetch(JWKS_URL);
  if (!response.ok) {
    throw new Error(`JWKS request failed with status ${response.status}`);
  }

  const body = (await response.json()) as JwksResponse;
  const keys = new Map<string, KeyObject>();
  for (const jwk of body.keys ?? []) {
    if (!jwk.kid) {
      continue;
    }
    keys.set(jwk.kid, createPublicKey({ key: jwk, format: 'jwk' }));
  }

  cache = { keys, fetchedAt: Date.now() };
  return keys;
}

async function getSigningKey(kid: string, forceRefresh = false): Promise<KeyObject> {
  if (
    !forceRefresh &&
    cache &&
    Date.now() - cache.fetchedAt < CACHE_TTL_MS &&
    cache.keys.has(kid)
  ) {
    return cache.keys.get(kid)!;
  }

  const keys = await fetchKeys();
  const key = keys.get(kid);
  if (!key) {
    throw new Error(`Unknown signing key: ${kid}`);
  }
  return key;
}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

async function resolveUser(token: string): Promise<AuthUser> {
  const decoded = decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    throw new UnauthorizedException('Invalid token');
  }

  const kid = decoded.header.kid;
  let key: KeyObject;
  try {
    key = await getSigningKey(kid);
  } catch {
    key = await getSigningKey(kid, true);
  }

  const payload = verify(token, key, {
    algorithms: ['RS256'],
    issuer: ISSUERS,
  }) as KeycloakJwtPayload;

  if (typeof payload.preferred_username !== 'string') {
    throw new UnauthorizedException('Token has no preferred_username');
  }

  return {
    username: payload.preferred_username,
    sub: typeof payload.sub === 'string' ? payload.sub : '',
    roles: payload.realm_access?.roles ?? [],
  };
}

export { extractBearerToken };

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      request.user = await resolveUser(token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
