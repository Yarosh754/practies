import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { ApiError } from '../common/dto/api-error.dto';
import { ChatService } from './chat.service';
import { ChatListItem } from './dto/chat-list-item.dto';
import { ChatMessage } from './dto/chat-message.dto';
import { SendMessageRequest } from './dto/send-message-request.dto';

const CHAT_ID_PARAM = {
  name: 'chatId',
  description: 'Формат ID — adId_user1_user2',
  example: '123_admin_user1',
};

@ApiTags('Chat')
@Controller('chats')
@UseGuards(KeycloakAuthGuard)
@ApiSecurity('keycloak')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get()
  @ApiOperation({
    operationId: 'listChats',
    summary: 'Список чатов пользователя',
    description:
      'Возвращает список чатов, где текущий пользователь является покупателем или продавцом.',
  })
  @ApiOkResponse({ type: [ChatListItem] })
  @ApiUnauthorizedResponse({ type: ApiError })
  list(@CurrentUser() user: AuthUser): Promise<ChatListItem[]> {
    return this.chat.listChats(user);
  }

  @Get(':chatId/messages')
  @ApiOperation({
    operationId: 'getChatMessages',
    summary: 'Получить сообщения чата',
    description:
      'Возвращает историю сообщений. Также помечает их как прочитанные для текущего пользователя.',
  })
  @ApiParam(CHAT_ID_PARAM)
  @ApiOkResponse({ type: [ChatMessage] })
  @ApiBadRequestResponse({ type: ApiError })
  @ApiForbiddenResponse({ type: ApiError })
  @ApiNotFoundResponse({ type: ApiError })
  @ApiUnauthorizedResponse({ type: ApiError })
  getMessages(
    @CurrentUser() user: AuthUser,
    @Param('chatId') chatId: string,
  ): Promise<ChatMessage[]> {
    return this.chat.getMessages(chatId, user);
  }

  @Post(':chatId/messages')
  @ApiOperation({
    operationId: 'sendMessage',
    summary: 'Отправить сообщение',
    description: 'Отправка сообщения в чат.',
  })
  @ApiParam(CHAT_ID_PARAM)
  @ApiCreatedResponse({ type: ChatMessage })
  @ApiBadRequestResponse({ type: ApiError })
  @ApiForbiddenResponse({ type: ApiError })
  @ApiNotFoundResponse({ type: ApiError })
  @ApiUnauthorizedResponse({ type: ApiError })
  sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('chatId') chatId: string,
    @Body() body: SendMessageRequest,
  ): Promise<ChatMessage> {
    return this.chat.sendMessage(chatId, body, user);
  }
}
