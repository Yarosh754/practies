import {createContext, useCallback, useContext, useMemo, type ReactNode,} from 'react';
import { apiClient } from '../api/client';
import { authHeaders, getApiErrorMessage } from '../api/helpers';
import type { components, operations } from '../api/schema';
import { useAuth } from './AuthContext';

type Ad = components['schemas']['Ad'];
type AdStatus = components['schemas']['AdStatus'];
type CreateAdRequest = components['schemas']['CreateAdRequest'];
type ListAdsQuery = NonNullable<operations['listAds']['parameters']['query']>;

interface AdContextType {
  listAds: (query?: ListAdsQuery) => Promise<Ad[]>;
  getAd: (id: string) => Promise<Ad>;
  createAd: (payload: CreateAdRequest) => Promise<Ad>;
  updateAd: (id: string, payload: CreateAdRequest) => Promise<Ad>;
  changeStatus: (id: string, status: AdStatus) => Promise<Ad>;
  moderate: (id: string, decision: 'approve' | 'reject') => Promise<Ad>;
  uploadImage: (file: File) => Promise<string>;
}

const AdContext = createContext<AdContextType | null>(null);

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds должен использоваться внутри AdProvider');
  }
  return context;
};

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const { keycloak } = useAuth();

  const listAds = useCallback(
    async (query?: ListAdsQuery) => {
      const { data, error } = await apiClient.GET('/ads', {
        params: { query },
        headers: authHeaders(keycloak),
      });
      if (error) throw new Error(getApiErrorMessage(error));
      return data ?? [];
    },
    [keycloak],
  );

  const getAd = useCallback(
    async (id: string) => {
      const { data, error } = await apiClient.GET('/ads/{id}', {
        params: { path: { id } },
        headers: authHeaders(keycloak),
      });
      if (error) throw new Error(getApiErrorMessage(error));
      if (!data) throw new Error('Объявление не найдено');
      return data;
    },
    [keycloak],
  );

  const createAd = useCallback(
    async (payload: CreateAdRequest) => {
      if (!keycloak?.token) throw new Error('Требуется авторизация');
      const { data, error } = await apiClient.POST('/ads', {
        body: payload,
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      if (error) throw new Error(getApiErrorMessage(error));
      if (!data) throw new Error('Не удалось создать объявление');
      return data;
    },
    [keycloak],
  );

  const updateAd = useCallback(
    async (id: string, payload: CreateAdRequest) => {
      if (!keycloak?.token) throw new Error('Требуется авторизация');
      const { data, error } = await apiClient.PUT('/ads/{id}', {
        params: { path: { id } },
        body: payload,
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      if (error) throw new Error(getApiErrorMessage(error));
      if (!data) throw new Error('Не удалось обновить объявление');
      return data;
    },
    [keycloak],
  );

  const changeStatus = useCallback(
    async (id: string, status: AdStatus) => {
      if (!keycloak?.token) throw new Error('Требуется авторизация');
      const { data, error } = await apiClient.PATCH('/ads/{id}/status', {
        params: { path: { id } },
        body: { status },
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      if (error) throw new Error(getApiErrorMessage(error));
      if (!data) throw new Error('Не удалось изменить статус объявления');
      return data;
    },
    [keycloak],
  );

  const moderate = useCallback(
    async (id: string, decision: 'approve' | 'reject') => {
      if (!keycloak?.token) throw new Error('Требуется авторизация');
      const { data, error } = await apiClient.POST('/ads/{id}/moderate', {
        params: { path: { id } },
        body: { decision },
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      if (error) throw new Error(getApiErrorMessage(error));
      if (!data) throw new Error('Не удалось провести модерацию');
      return data;
    },
    [keycloak],
  );

  const uploadImage = useCallback(
    async (file: File) => {
      if (!keycloak?.token) throw new Error('Требуется авторизация');

      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await apiClient.POST('/images', {
        body: formData as unknown as { file: string },
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      if (error) throw new Error(getApiErrorMessage(error));
      if (!data) throw new Error('Не удалось загрузить изображение');
      return data.id;
    },
    [keycloak],
  );

  const value = useMemo(
    () => ({
      listAds,
      getAd,
      createAd,
      updateAd,
      changeStatus,
      moderate,
      uploadImage,
    }),
    [
      listAds,
      getAd,
      createAd,
      updateAd,
      changeStatus,
      moderate,
      uploadImage,
    ],
  );

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
};
