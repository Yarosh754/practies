import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth.types';
import { AdsService, toAd } from '../ads/ads.service';
import type { AdEntity } from '../ads/entities/ad.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatListItem } from './dto/chat-list-item.dto';
import { ChatMessage } from './dto/chat-message.dto';
import { SendMessageRequest } from './dto/send-message-request.dto';
import { ChatMessageEntity } from './entities/chat-message.entity';

const CHAT_ID_PATTERN = /^(\d+)_([^_]+)_([^_]+)$/;

interface ChatContext {
  ad: AdEntity;
  u1: string;
  u2: string;
}

function parseChatId(chatId: string): { adId: string; u1: string; u2: string } {
  const match = CHAT_ID_PATTERN.exec(chatId);
  if (!match) {
    throw new BadRequestException('Invalid chatId format');
  }

  const [, adId, u1, u2] = match;
  if (u1 === u2) {
    throw new BadRequestException('Chat participants must differ');
  }
  return { adId, u1, u2 };
}

export function toChatMessage(entity: ChatMessageEntity): ChatMessage {
  return {
    id: String(entity.id),
    chatId: entity.chatId,
    senderId: entity.senderId,
    text: entity.text,
    createdAt: new Date(entity.createdAt).toISOString(),
    isRead: entity.isRead,
  };
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly messages: Repository<ChatMessageEntity>,
    private readonly ads: AdsService,
    private readonly notifications: NotificationsService,
  ) {}

  private async getContext(
    chatId: string,
    user: AuthUser,
  ): Promise<ChatContext> {
    const { adId, u1, u2 } = parseChatId(chatId);
    const ad = await this.ads.getEntityOrFail(adId);

    if (ad.authorId !== u1 && ad.authorId !== u2) {
      throw new ForbiddenException('Chat does not belong to the ad author');
    }
    if (user.username !== u1 && user.username !== u2) {
      throw new ForbiddenException('Not a chat participant');
    }

    return { ad, u1, u2 };
  }

  async listChats(user: AuthUser): Promise<ChatListItem[]> {
    const rows = await this.messages
      .createQueryBuilder('m')
      .where(
        "split_part(m.chat_id, '_', 2) = :username OR split_part(m.chat_id, '_', 3) = :username",
        { username: user.username },
      )
      .orderBy('m.created_at', 'ASC')
      .getMany();

    const groups = new Map<string, ChatMessageEntity[]>();
    for (const row of rows) {
      const group = groups.get(row.chatId);
      if (group) {
        group.push(row);
      } else {
        groups.set(row.chatId, [row]);
      }
    }

    const items: ChatListItem[] = [];
    for (const [chatId, chatMessages] of groups) {
      let parsed: { adId: string; u1: string; u2: string };
      try {
        parsed = parseChatId(chatId);
      } catch {
        continue;
      }

      const ad = await this.ads.findEntity(parsed.adId);
      if (!ad) {
        continue;
      }

      const lastMessage = chatMessages[chatMessages.length - 1];
      items.push({
        chatId,
        otherUser: parsed.u1 === user.username ? parsed.u2 : parsed.u1,
        ad: toAd(ad),
        lastMessage: toChatMessage(lastMessage),
        unreadCount: chatMessages.filter(
          (message) => message.senderId !== user.username && !message.isRead,
        ).length,
      });
    }

    return items.sort(
      (left, right) =>
        new Date(right.lastMessage.createdAt).getTime() -
        new Date(left.lastMessage.createdAt).getTime(),
    );
  }

  async getMessages(chatId: string, user: AuthUser): Promise<ChatMessage[]> {
    await this.getContext(chatId, user);

    await this.messages.update(
      {
        chatId,
        senderId: Not(user.username),
        isRead: false,
      },
      { isRead: true },
    );

    const rows = await this.messages.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });
    return rows.map(toChatMessage);
  }

  async sendMessage(
    chatId: string,
    body: SendMessageRequest,
    user: AuthUser,
  ): Promise<ChatMessage> {
    const { ad, u1, u2 } = await this.getContext(chatId, user);
    const text = body.text.trim();
    if (!text) {
      throw new BadRequestException('Message text is required');
    }

    const message = await this.messages.save(
      this.messages.create({
        chatId,
        senderId: user.username,
        text,
        isRead: false,
      }),
    );

    const recipient = u1 === user.username ? u2 : u1;
    await this.notifications.create(
      recipient,
      `Новое сообщение по объявлению "${ad.title}" от ${user.username}`,
      `/messenger?chatId=${chatId}`,
    );

    return toChatMessage(message);
  }
}
