import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdComponent from '../components/AdComponent';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdContext';
import { useDictionaries } from '../contexts/DictionariesContext';
import { getApiErrorMessage } from '../api/helpers';
import { adminStatusOptions, type AdStatus } from '../constants/filters';
import type { components } from '../api/schema';
import './Moderate.css';

type Ad = components['schemas']['Ad'];

function Moderate() {
  const { listAds } = useAds();
  const { keycloak, authtrue } = useAuth();
  const { getLocationLabel } = useDictionaries();
  const isAdmin = Boolean(keycloak?.realmAccess?.roles?.includes('admin'));
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<AdStatus>('MODERATION');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDefault = statusFilter === 'MODERATION';

  const handleClear = () => {
    setStatusFilter('MODERATION');
  };

  useEffect(() => {
    if (!authtrue) {
      return;
    }

    if (!isAdmin) {
      navigate('/', { replace: true });
      return;
    }

    let cancelled = false;

    listAds({ status: statusFilter, sort: 'date-asc' })
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
  }, [authtrue, isAdmin, statusFilter, listAds, navigate]);

  if (!authtrue || !isAdmin) {
    return null;
  }

  return (
    <div className="moderate-main-container">
      <div className="moderate-header-container">
        <p className="p-moderate-ads">Модерация</p>
      </div>

      <div className="moderate-filters-container">
        <select className={`moderate-select-container ${!isDefault ? 'active' : ''}`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AdStatus)} >
          {adminStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {!isDefault && (
          <button type="button" className="moderate-clear-button" onClick={handleClear} >
            Очистить фильтр
          </button>
        )}
      </div>

      {loading ? (
        <p className="p-moderate-empty">Загрузка объявлений...</p>
      ) : error ? (
        <p className="p-moderate-empty">{error}</p>
      ) : ads.length === 0 ? (
        <p className="p-moderate-empty">Нет объявлений с таким статусом.</p>
      ) : (
        <div className="moderate-ads-container">
          {ads.map((ad) => (
            <Link key={ad.id} to={`/adMain/${ad.id}`} className="ad-link">
              <AdComponent adId={ad.id} title={ad.title} price={ad.price} image={ad.images?.[0] || ''} location={getLocationLabel(ad.location)} date={ad.createdAt}/>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Moderate;
