import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { RequestWithUser } from './auth.types';
import { extractBearerToken, KeycloakAuthGuard } from './keycloak-auth.guard';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly requiredGuard: KeycloakAuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!extractBearerToken(request)) {
      return true;
    }

    const user = await this.requiredGuard.canActivate(context).then(
      () => context.switchToHttp().getRequest<RequestWithUser>().user,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}
