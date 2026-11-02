import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Notification {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty({
    format: 'date-time',
    example: '2024-10-22T18:59:00.000Z',
    description: 'Дата и время создания в формате ISO 8601 (UTC)',
  })
  createdAt!: string;

  @ApiProperty()
  read!: boolean;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description: 'Ссылка для перехода к связанному объекту',
  })
  link?: string | null;
}
