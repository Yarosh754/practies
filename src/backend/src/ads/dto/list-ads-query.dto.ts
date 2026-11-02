import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { AdStatus } from './ad-status.enum';

export const AD_SORTS = ['date-desc', 'date-asc', 'price-asc', 'price-desc'] as const;
export type AdSort = (typeof AD_SORTS)[number];

export class ListAdsQuery {
  @ApiPropertyOptional({ description: 'Фильтр по ID категории' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Фильтр по городу' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Фильтр по имени пользователя (для "Моих объявлений")' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    enum: AD_SORTS,
    default: 'date-desc',
    description: 'Сортировка',
  })
  @IsOptional()
  @IsIn(AD_SORTS)
  sort?: AdSort;

  @ApiPropertyOptional({
    enum: AdStatus,
    enumName: 'AdStatus',
    description: 'Фильтр по статусу (только admin)',
  })
  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;
}
