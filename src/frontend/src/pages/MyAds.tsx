import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdComponent from '../components/AdComponent';
import { useAds } from '../contexts/AdContext';
import { useAuth } from '../contexts/AuthContext';
import { useDictionaries } from '../contexts/DictionariesContext';
import { getApiErrorMessage } from '../api/helpers';
import { statusOptions, type AdSort } from '../constants/filters';
import type { components } from '../api/schema';
import './MyAds.css';

type Ad = components['schemas']['Ad'];

interface FiltersValue {
  status: string;
  sort: AdSort;
}

function MyAds() {
  const { listAds } = useAds();
  const { user, authtrue } = useAuth();
  const { getLocationLabel } = useDictionaries();

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersValue>({
    status: 'ACTIVE',
    sort: 'date-desc',
  });

  const updateFilter = (key: keyof FiltersValue, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }) as FiltersValue);
  };

  const handleClearFilters = () => {
    setFilters({ status: 'ACTIVE', sort: 'date-desc' });
  };

  const isFiltersDefault =
    filters.status === 'ACTIVE' && filters.sort === 'date-desc';

  useEffect(() => {
    if (!authtrue || !user?.username) {
      return;
    }

    let cancelled = false;

    listAds({ authorId: user.username, sort: filters.sort })
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
  }, [authtrue, user?.username, filters.sort, listAds]);

  const visibleAds = filters.status
    ? ads.filter((ad) => ad.status === filters.status)
    : ads;

  return (
    <div className="myAds-main-container">
      <div className="myAds-header-container">
        <p className="p-myAds-ads">Мои объявления</p>
      </div>

      <div className="myAds-filters-container">
        <select className={`myAds-select-container ${filters.status !== 'ACTIVE' ? 'active' : ''}`} value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {!isFiltersDefault && (
          <button type="button" className="myAds-clear-button" onClick={handleClearFilters}>
            Очистить фильтры
          </button>
        )}
      </div>

      {!authtrue ? (
        <p className="p-myAds-empty">Войдите, чтобы увидеть свои объявления.</p>
      ) : loading ? (
        <p className="p-myAds-empty">Загрузка объявлений...</p>
      ) : error ? (
        <p className="p-myAds-empty">{error}</p>
      ) : visibleAds.length === 0 ? (
        <p className="p-myAds-empty">Ничего не найдено. Измените фильтры.</p>
      ) : (
        <div className="myAds-ads-container">
          {visibleAds.map((ad) => (
            <Link key={ad.id} to={`/adMain/${ad.id}`} className="ad-link">
              <AdComponent adId={ad.id} title={ad.title} price={ad.price} image={ad.images?.[0] || ''} location={getLocationLabel(ad.location)} date={ad.createdAt} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAds;
