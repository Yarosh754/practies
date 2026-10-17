import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Ad } from '../types';
import { loadFromStorage, saveToStorage } from '../storage/storage';
import { seedAds } from '../storage/seedAd';

interface AdContextType {
  ads: Ad[];
  addAd: (ad: Omit<Ad, 'id' | 'createdAt'>) => void;
  updateAd: (id: string, patch: Partial<Ad>) => void; 
  changeStatus: (id: string, status: Ad['status']) => void;
  removeAd: (id: string) => void;
}

const AdContext = createContext<AdContextType>({
  ads: [],
  addAd: () => {},
  updateAd: () => {},
  changeStatus: () => {},
  removeAd: () => {},
});

export const useAds = () => useContext(AdContext);

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const [ads, setAds] = useState<Ad[]>(() =>
    loadFromStorage<Ad[]>('ads', seedAds),
  );

  useEffect(() => {
    saveToStorage('ads', ads);
  }, [ads]);

  const addAd: AdContextType['addAd'] = (newAd) => {
    const ad: Ad = {
      ...newAd,
      id: String(Date.now()),
      createdAt: new Date().toLocaleString('ru-RU', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      }),
    };
    setAds((prev) => [ad, ...prev]);
  };

  const changeStatus: AdContextType['changeStatus'] = (id, status) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const removeAd = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAd: AdContextType['updateAd'] = (id, patch) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  return (
    <AdContext.Provider value={{ ads, addAd, updateAd, changeStatus, removeAd }}>
      {children}
    </AdContext.Provider>
  );
};