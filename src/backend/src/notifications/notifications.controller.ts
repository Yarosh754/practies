import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import type { AuthUser } from '../auth/auth.types';
import { ApiError } from '../common/dto/api-error.dto';
import { Notification } from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(KeycloakAuthGuard)
@ApiSecurity('keycloak')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ operationId: 'listNotifications', summary: 'Получить уведомления пользователя' })
  @ApiOkResponse({ type: [Notification] })
  @ApiUnauthorizedResponse({ type: ApiError })
  list(@CurrentUser() user: AuthUser): Promise<Notification[]> {
    return this.notifications.list(user.username);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ operationId: 'clearNotifications', summary: 'Очистить все уведомления' })
  @ApiNoContentResponse({ description: 'Очищено' })
  @ApiUnauthorizedResponse({ type: ApiError })
  clear(@CurrentUser() user: AuthUser): Promise<void> {
    return this.notifications.clear(user.username);
  }

  @Patch('read')
  @HttpCode(200)
  @ApiOperation({ operationId: 'markAllAsRead', summary: 'Отметить все уведомления как прочитанные' })
  @ApiOkResponse({ description: 'Успешно' })
  @ApiUnauthorizedResponse({ type: ApiError })
  markAllAsRead(@CurrentUser() user: AuthUser): Promise<void> {
    return this.notifications.markAllAsRead(user.username);
  }
}
