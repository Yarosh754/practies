import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiClient } from '../api/client';
import type { components } from '../api/schema';

type Option = components['schemas']['Option'];

interface DictionariesContextType {
  categories: Option[];
  locations: Option[];
  loading: boolean;
  getCategoryLabel: (value: string) => string;
  getLocationLabel: (value: string) => string;
}

const DictionariesContext = createContext<DictionariesContextType | null>(null);

export const useDictionaries = () => {
  const context = useContext(DictionariesContext);
  if (!context) {
    throw new Error('useDictionaries must be used within DictionariesProvider');
  }
  return context;
};

export const DictionariesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Option[]>([]);
  const [locations, setLocations] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .GET('/dictionaries')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load dictionaries:', error);
          return;
        }
        setCategories(data?.categories ?? []);
        setLocations(data?.locations ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getCategoryLabel = useCallback(
    (value: string) =>
      categories.find((category) => category.value === value)?.label ?? value,
    [categories],
  );

  const getLocationLabel = useCallback(
    (value: string) =>
      locations.find((location) => location.value === value)?.label ?? value,
    [locations],
  );

  const contextValue = useMemo(
    () => ({
      categories,
      locations,
      loading,
      getCategoryLabel,
      getLocationLabel,
    }),
    [categories, locations, loading, getCategoryLabel, getLocationLabel],
  );

  return (
    <DictionariesContext.Provider value={contextValue}>
      {children}
    </DictionariesContext.Provider>
  );
};
