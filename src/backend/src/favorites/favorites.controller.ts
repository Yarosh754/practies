import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { ApiError } from '../common/dto/api-error.dto';
import { AddFavoriteRequest } from './dto/add-favorite-request.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(KeycloakAuthGuard)
@ApiSecurity('keycloak')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  @ApiOperation({ operationId: 'listFavorites', summary: 'Получить список ID избранных объявлений' })
  @ApiOkResponse({
    description: 'Массив ID объявлений',
    schema: { type: 'array', items: { type: 'string' } },
  })
  @ApiUnauthorizedResponse({ type: ApiError })
  list(@CurrentUser() user: AuthUser): Promise<string[]> {
    return this.favorites.list(user.username);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ operationId: 'addFavorite', summary: 'Добавить объявление в избранное' })
  @ApiOkResponse({ description: 'Добавлено' })
  @ApiBadRequestResponse({ type: ApiError })
  @ApiNotFoundResponse({ type: ApiError })
  @ApiUnauthorizedResponse({ type: ApiError })
  add(
    @CurrentUser() user: AuthUser,
    @Body() body: AddFavoriteRequest,
  ): Promise<void> {
    return this.favorites.add(user.username, body.adId);
  }

  @Delete(':adId')
  @HttpCode(204)
  @ApiOperation({ operationId: 'removeFavorite', summary: 'Удалить объявление из избранного' })
  @ApiParam({ name: 'adId' })
  @ApiNoContentResponse({ description: 'Удалено' })
  @ApiUnauthorizedResponse({ type: ApiError })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('adId') adId: string,
  ): Promise<void> {
    return this.favorites.remove(user.username, adId);
  }
}
