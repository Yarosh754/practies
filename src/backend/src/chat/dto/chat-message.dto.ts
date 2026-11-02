import { ApiProperty } from '@nestjs/swagger';

export class ChatMessage {
  @ApiProperty({ example: '1729582345679' })
  id!: string;

  @ApiProperty({ example: '1_admin_user' })
  chatId!: string;

  @ApiProperty({ description: 'username отправителя', example: 'user' })
  senderId!: string;

  @ApiProperty()
  text!: string;

  @ApiProperty({
    format: 'date-time',
    example: '2024-10-22T18:59:00.000Z',
    description: 'Дата и время отправки в формате ISO 8601 (UTC)',
  })
  createdAt!: string;

  @ApiProperty()
  isRead!: boolean;
}
