import { Global, Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { KeycloakAuthGuard } from './keycloak-auth.guard';
import { OptionalAuthGuard } from './optional-auth.guard';

@Global()
@Module({
  providers: [KeycloakAuthGuard, OptionalAuthGuard, AdminGuard],
  exports: [KeycloakAuthGuard, OptionalAuthGuard, AdminGuard],
})
export class AuthModule {}
