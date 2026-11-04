import type { components, operations } from '../api/schema';

export type Option = components['schemas']['Option'];
export type AdStatus = components['schemas']['AdStatus'];
export type AdSort = NonNullable<operations['listAds']['parameters']['query']>['sort'];

export const statusOptions: Option[] = [
  { value: 'ACTIVE', label: 'Активные' },
  { value: 'MODERATION', label: 'На модерации' },
  { value: 'SOLD', label: 'Проданные' },
  { value: 'DELETE', label: 'Удаленные' },
  { value: 'REJECTED', label: 'Отклоненные' },
];

export const adminStatusOptions: Option[] = statusOptions.filter((option) =>
  ['MODERATION', 'REJECTED', 'SOLD'].includes(option.value),
);

export const sortOptions: Option[] = [
  { value: 'date-desc', label: 'Сначала новые' },
  { value: 'date-asc', label: 'Сначала старые' },
  { value: 'price-asc', label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
];

export const statusLabels: Record<AdStatus, string> = {
  ACTIVE: 'Активно',
  MODERATION: 'На модерации',
  SOLD: 'Продано',
  DELETE: 'Удалено',
  REJECTED: 'Отклонено',
};
