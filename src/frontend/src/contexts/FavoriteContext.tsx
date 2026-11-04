import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode,} from 'react';
import { apiClient } from '../api/client';
import { getApiErrorMessage } from '../api/helpers';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: string[];
  loading: boolean;
  isFavorite: (adId: string) => boolean;
  toggleFavorite: (adId: string) => Promise<void>;
  reload: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites должен использоваться внутри FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { keycloak, authtrue } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!keycloak?.token) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await apiClient.GET('/favorites', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      if (error) throw new Error(getApiErrorMessage(error));
      setFavorites(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [keycloak]);

  useEffect(() => {
    if (!authtrue) {
      setFavorites([]);
      return;
    }

    reload().catch((error) =>
      console.error('Failed to load favorites:', error),
    );
  }, [authtrue, reload]);

  const isFavorite = useCallback(
    (adId: string) => favorites.includes(adId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (adId: string) => {
      if (!keycloak?.token) throw new Error('Требуется авторизация');

      const headers = { Authorization: `Bearer ${keycloak.token}` };
      const alreadyFavorite = favorites.includes(adId);

      if (alreadyFavorite) {
        const { error } = await apiClient.DELETE('/favorites/{adId}', {
          params: { path: { adId } },
          headers,
        });
        if (error) throw new Error(getApiErrorMessage(error));
        setFavorites((previous) => previous.filter((id) => id !== adId));
        return;
      }

      const { error } = await apiClient.POST('/favorites', {
        body: { adId },
        headers,
      });
      if (error) throw new Error(getApiErrorMessage(error));
      setFavorites((previous) => [...previous, adId]);
    },
    [keycloak, favorites],
  );

  const contextValue = useMemo(
    () => ({
      favorites,
      loading,
      isFavorite,
      toggleFavorite,
      reload,
    }),
    [favorites, loading, isFavorite, toggleFavorite, reload],
  );

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};
