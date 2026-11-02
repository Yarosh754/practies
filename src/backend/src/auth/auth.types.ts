import type { Request } from 'express';

export interface AuthUser {
  username: string;
  sub: string;
  roles: string[];
}

export interface KeycloakJwtPayload {
  sub?: string;
  preferred_username?: string;
  iss?: string;
  realm_access?: {
    roles?: string[];
  };
}

export type RequestWithUser = Request & { user?: AuthUser };
