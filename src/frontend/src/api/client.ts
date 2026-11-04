import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:9100';

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
});
