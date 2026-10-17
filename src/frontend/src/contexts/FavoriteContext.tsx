import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useAds } from './AdContext';
import { loadFromStorage, saveToStorage } from '../storage/storage';
import type { FavoriteUser } from '../types';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (adId: string) => boolean;
  toggleFavorite: (adId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { ads } = useAds();
  const userId = user?.id ?? null;

  const [allFavorites, setAllFavorites] = useState<FavoriteUser[]>(() =>
    loadFromStorage<FavoriteUser[]>('favorites', []),
  );

  useEffect(() => {
    saveToStorage('favorites', allFavorites);
  }, [allFavorites]);

  useEffect(() => {
    const inactiveIds = new Set(
      ads.filter((a) => a.status !== 'ACTIVE').map((a) => a.id),
    );
    if (inactiveIds.size === 0) return;

    setAllFavorites((prev) => {
      const next = prev.filter((f) => !inactiveIds.has(f.adId));
      return next.length === prev.length ? prev : next;
    });
  }, [ads]);

  const favorites = userId ? allFavorites.filter((f) => f.userId === userId).map((f) => f.adId) : [];

  const isFavorite = (adId: string) => favorites.includes(adId);

  const toggleFavorite = (adId: string) => {
    if (!userId) return;

    const ad = ads.find((a) => a.id === adId);
    if (!ad) return;

    setAllFavorites((prev) => {
      const exists = prev.some((f) => f.userId === userId && f.adId === adId);

      if (exists) {
        return prev.filter((f) => !(f.userId === userId && f.adId === adId));
      }

      if (ad.status !== 'ACTIVE') return prev;

      return [...prev, { userId, adId }];
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};