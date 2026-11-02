import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser, RequestWithUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { ApiError } from '../common/dto/api-error.dto';
import { AdsService } from './ads.service';
import { Ad } from './dto/ad.dto';
import { CreateAdRequest } from './dto/create-ad-request.dto';
import { ListAdsQuery } from './dto/list-ads-query.dto';
import { UpdateAdStatusRequest } from './dto/update-ad-status-request.dto';

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly ads: AdsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'listAds',
    summary: 'Получить список объявлений',
    description:
      'Возвращает список активных объявлений. По умолчанию отдаются только `ACTIVE`. ' +
      'Если передан параметр `authorId`, возвращает объявления конкретного пользователя (включая `MODERATION`, `SOLD` и т.д.).',
  })
  @ApiOkResponse({ type: [Ad] })
  @ApiBadRequestResponse({ type: ApiError })
  list(
    @Req() request: RequestWithUser,
    @Query() query: ListAdsQuery,
  ): Promise<Ad[]> {
    return this.ads.list(query, request.user);
  }

  @Post()
  @UseGuards(KeycloakAuthGuard)
  @ApiSecurity('keycloak')
  @ApiOperation({
    operationId: 'createAd',
    summary: 'Создать объявление',
    description:
      'Создаёт объявление со статусом `MODERATION`. `authorId` берётся из токена. `createdAt` ставится сервером. ' +
      'Изображения передаются массивом строк (идентификаторов изображений).',
  })
  @ApiCreatedResponse({ type: Ad })
  @ApiBadRequestResponse({ type: ApiError })
  @ApiUnauthorizedResponse({ type: ApiError })
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateAdRequest,
  ): Promise<Ad> {
    return this.ads.create(body, user);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'getAd',
    summary: 'Получить объявление по ID',
    description:
      'Объявления в статусе `MODERATION` доступны только автору и админу.',
  })
  @ApiParam({ name: 'id', description: 'Идентификатор объявления' })
  @ApiOkResponse({ type: Ad })
  @ApiNotFoundResponse({ type: ApiError })
  get(@Req() request: RequestWithUser, @Param('id') id: string): Promise<Ad> {
    return this.ads.get(id, request.user);
  }

  @Put(':id')
  @UseGuards(KeycloakAuthGuard)
  @ApiSecurity('keycloak')
  @ApiOperation({
    operationId: 'updateAd',
    summary: 'Обновить объявление',
    description:
      'Только автор. После обновления статус сбрасывается в `MODERATION`.',
  })
  @ApiParam({ name: 'id', description: 'Идентификатор объявления' })
  @ApiOkResponse({ type: Ad })
  @ApiForbiddenResponse({ type: ApiError })
  @ApiNotFoundResponse({ type: ApiError })
  @ApiUnauthorizedResponse({ type: ApiError })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: CreateAdRequest,
  ): Promise<Ad> {
    return this.ads.update(id, body, user);
  }

  @Patch(':id/status')
  @UseGuards(KeycloakAuthGuard)
  @ApiSecurity('keycloak')
  @ApiOperation({
    operationId: 'updateAdStatus',
    summary: 'Сменить статус объявления',
    description:
      'Автор может ставить `SOLD` или `DELETE`. Админ может ставить любые статусы.',
  })
  @ApiParam({ name: 'id', description: 'Идентификатор объявления' })
  @ApiOkResponse({ type: Ad })
  @ApiForbiddenResponse({ type: ApiError })
  @ApiNotFoundResponse({ type: ApiError })
  @ApiBadRequestResponse({ type: ApiError })
  @ApiUnauthorizedResponse({ type: ApiError })
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateAdStatusRequest,
  ): Promise<Ad> {
    return this.ads.updateStatus(id, body.status, user);
  }
}
