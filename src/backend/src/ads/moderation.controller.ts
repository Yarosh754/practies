import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { ApiError } from '../common/dto/api-error.dto';
import { AdsService } from './ads.service';
import { Ad } from './dto/ad.dto';
import { ModerateAdRequest } from './dto/moderate-ad-request.dto';

@ApiTags('Moderation')
@Controller('ads')
@UseGuards(KeycloakAuthGuard, AdminGuard)
@ApiSecurity('keycloak')
export class ModerationController {
  constructor(private readonly ads: AdsService) {}

  @Post(':id/moderate')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'moderateAd',
    summary: 'Модерация объявления',
    description:
      'Только для администратора. Принимает `approve` (статус `ACTIVE`) или `reject` (статус `REJECTED`).',
  })
  @ApiParam({ name: 'id', description: 'Идентификатор объявления' })
  @ApiOkResponse({ type: Ad })
  @ApiForbiddenResponse({ type: ApiError })
  @ApiNotFoundResponse({ type: ApiError })
  @ApiBadRequestResponse({ type: ApiError })
  @ApiUnauthorizedResponse({ type: ApiError })
  moderate(
    @Param('id') id: string,
    @Body() body: ModerateAdRequest,
  ): Promise<Ad> {
    return this.ads.moderate(id, body.decision);
  }
}
