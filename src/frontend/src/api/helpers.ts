import type Keycloak from 'keycloak-js';
import { API_BASE_URL } from './client';
import type { components } from './schema';

type ApiError = components['schemas']['ApiError'];

export function authHeaders(keycloak: Keycloak | null): Record<string, string> {
  return keycloak?.token ? { Authorization: `Bearer ${keycloak.token}` } : {};
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Не удалось выполнить запрос. Попробуйте ещё раз.',
): string {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  if (typeof error === 'object') {
    const message = (error as ApiError).message;
    if (Array.isArray(message) && message.length > 0) {
      return message.join(', ');
    }
    if (typeof message === 'string' && message) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getImageUrl(imageId: string): string {
  if (!imageId) return '';
  if (/^(https?:|data:)/i.test(imageId)) return imageId;
  return `${API_BASE_URL}/images/${encodeURIComponent(imageId)}`;
}
