import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdComponent from '../components/AdComponent';
import { useAds } from '../contexts/AdContext';
import { useFavorites } from '../contexts/FavoriteContext';
import { useAuth } from '../contexts/AuthContext';
import { useDictionaries } from '../contexts/DictionariesContext';
import { getApiErrorMessage } from '../api/helpers';
import { sortOptions, type AdSort } from '../constants/filters';
import type { components } from '../api/schema';
import './Home.css';

type Ad = components['schemas']['Ad'];

interface FiltersValue {
  category: string;
  location: string;
  sort: AdSort;
  favoritesOnly: boolean;
}

function Home() {
  const { listAds } = useAds();
  const { favorites } = useFavorites();
  const { authtrue } = useAuth();
  const { categories, locations, getLocationLabel } = useDictionaries();

  const [filters, setFilters] = useState<FiltersValue>({
    category: '',
    location: '',
    sort: 'date-desc',
    favoritesOnly: false,
  });
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateFilter = (key: keyof FiltersValue, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }) as FiltersValue);
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      location: '',
      sort: 'date-desc',
      favoritesOnly: false,
    });
  };

  const isFiltersDefault =
    filters.category === '' &&
    filters.location === '' &&
    filters.sort === 'date-desc' &&
    filters.favoritesOnly === false;

  useEffect(() => {
    let cancelled = false;

    listAds({
      categoryId: filters.category || undefined,
      location: filters.location || undefined,
      sort: filters.sort,
    })
      .then((data) => {
        if (!cancelled) {
          setAds(data);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setAds([]);
          setError(getApiErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters.category, filters.location, filters.sort, listAds]);

  const visibleAds = filters.favoritesOnly
    ? ads.filter((ad) => favorites.includes(ad.id))
    : ads;

  return (
    <div className="home-main-container">
      <div className="home-header-container">
        <p className="p-home-ads">Объявления</p>
      </div>
      <div className="home-filters-container">
        <select className={`home-select-container ${filters.category ? 'active' : ''}`} value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <select className={`home-select-container ${filters.location ? 'active' : ''}`} value={filters.location} onChange={(e) => updateFilter('location', e.target.value)} >
          <option value="">Все города</option>
          {locations.map((location) => (
            <option key={location.value} value={location.value}>
              {location.label}
            </option>
          ))}
        </select>

        <select className={`home-select-container ${filters.sort !== 'date-desc' ? 'active' : ''}`} value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {authtrue && (
          <button type="button" className={`home-favorite-toggle ${filters.favoritesOnly ? 'active' : ''}`} onClick={() => updateFilter('favoritesOnly', !filters.favoritesOnly)} >
            Избранное {favorites.length > 0 && `(${favorites.length})`}
          </button>
        )}
        {!isFiltersDefault && (
          <button type="button" className="home-clear-button" onClick={handleClearFilters} >
            Очистить фильтры
          </button>
        )}
      </div>

      {loading ? (
        <p className="p-home-empty">Загрузка объявлений...</p>
      ) : error ? (
        <p className="p-home-empty">{error}</p>
      ) : visibleAds.length === 0 ? (
        <p className="p-home-empty">Ничего не найдено. Измените фильтры.</p>
      ) : (
        <div className="home-ads-container">
          {visibleAds.map((ad) => (
            <Link key={ad.id} to={`/adMain/${ad.id}`} className="ad-link">
              <AdComponent adId={ad.id} title={ad.title} price={ad.price} image={ad.images?.[0] || ''} location={getLocationLabel(ad.location)} date={ad.createdAt}/>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;