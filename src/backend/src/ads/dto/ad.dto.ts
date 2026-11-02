import { ApiProperty } from '@nestjs/swagger';
import { AdStatus } from './ad-status.enum';

export class Ad {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ maxLength: 30, example: 'iPhone 13 Pro 256GB' })
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ example: 750 })
  price!: number;

  @ApiProperty({ example: 'electronics' })
  categoryId!: string;

  @ApiProperty({ enum: AdStatus, enumName: 'AdStatus' })
  status!: AdStatus;

  @ApiProperty({ example: 'minsk' })
  location!: string;

  @ApiProperty({
    description: 'username автора (совпадает с preferred_username в Keycloak)',
  })
  authorId!: string;

  @ApiProperty({ example: '+375291234567' })
  phone!: string;

  @ApiProperty({
    format: 'date-time',
    example: '2024-10-22T18:58:00.000Z',
    description: 'Дата и время создания в формате ISO 8601 (UTC)',
  })
  createdAt!: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    description: 'Массив идентификаторов изображений (ID). Первый элемент — главное фото.',
  })
  images!: string[];
}
