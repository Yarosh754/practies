import { ApiProperty } from '@nestjs/swagger';
import { Ad } from '../../ads/dto/ad.dto';
import { ChatMessage } from './chat-message.dto';

export class ChatListItem {
  @ApiProperty()
  chatId!: string;

  @ApiProperty({ description: 'username собеседника' })
  otherUser!: string;

  @ApiProperty({ type: () => Ad })
  ad!: Ad;

  @ApiProperty({ type: () => ChatMessage })
  lastMessage!: ChatMessage;

  @ApiProperty({ type: 'integer' })
  unreadCount!: number;
}
