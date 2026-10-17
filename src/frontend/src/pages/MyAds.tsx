import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdComponent from '../components/AdComponent';
import { useAds } from '../contexts/AdContext';
import { seedStatus, seedLocations } from '../storage/seedAd';
import './MyAds.css';
import { useAuth } from '../contexts/AuthContext';

interface FiltersValue {
  status: string;
  sort: string;
}

function MyAds() {
  const { ads } = useAds();
  const {user} = useAuth();

  const [filters, setFilters] = useState<FiltersValue>({
    status:'ACTIVE',
    sort: 'date-desc'
  });

  const updateFilter = (key: keyof FiltersValue, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({status: 'ACTIVE', sort: 'date-desc'})
  };

  let visibleAds = ads.filter((ad) => {
    if (ad.authorId !== user.username) return false;
    if (filters.status && ad.status !== filters.status) return false;
    return true;
  });

  visibleAds = [...visibleAds].sort((a, b) => {return b.id.localeCompare(a.id);});

  return (
      <div className="myAds-main-container">
        <div className="myAds-header-container">
          <p className="p-myAds-ads">Мои объявления</p>
        </div>

        <div className="myAds-filters-container">
          <select className={`myAds-select-container ${filters.status !== 'ACTIVE' ? 'active' : ''}`} value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} >
            {seedStatus.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button type="button" className="myAds-clear-button" onClick={handleClearFilters}>
            Очистить фильтры
          </button>
        </div>

        {visibleAds.length === 0 ? (
          <p className="p-myAds-empty">Ничего не найдено. Измените фильтры.</p>
        ) : (
          <div className="myAds-ads-container">
            {visibleAds.map((ad) => (
              <Link key={ad.id} to={`/adMain/${ad.id}`} className="ad-link">
                <AdComponent adId={ad.id} title={ad.title} price={ad.price} image={ad.image} location={seedLocations.find((i) => i.value === ad.location)?.label ?? ad.location} date={ad.createdAt} />
             </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

export default MyAds;