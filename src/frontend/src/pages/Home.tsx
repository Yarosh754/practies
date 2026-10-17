import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdComponent from '../components/AdComponent';
import { useAds } from '../contexts/AdContext';
import { seedCategories, seedLocations, seedSortOptions } from '../storage/seedAd';
import './Home.css';
import { useFavorites } from '../contexts/FavoriteContext';
import { useAuth } from '../contexts/AuthContext';

interface FiltersValue {
  category: string;
  location: string;
  sort: string;
  favoritesOnly: boolean;
}

function Home() {
  const { ads } = useAds();
  const { favorites } = useFavorites();
  const { authtrue } = useAuth();

  const [filters, setFilters] = useState<FiltersValue>({
    category: '',
    location: '',
    sort: 'date-desc',
    favoritesOnly: false
  });

  const updateFilter = (key: keyof FiltersValue, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({category: '', location: '', sort: 'date-desc', favoritesOnly: false})
  };

  let visibleAds = ads.filter((ad) => {
    if (ad.status !== 'ACTIVE') return false;
    if (filters.category && ad.categoryId !== filters.category) return false;
    if (filters.location && ad.location !== filters.location) return false;
    if (filters.favoritesOnly && !favorites.includes(ad.id)) return false;
    return true;
  });

  visibleAds = [...visibleAds].sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'date-asc': return a.id.localeCompare(b.id);
      case 'date-desc':
      default: return b.id.localeCompare(a.id);
    }
  });

  return (
    <div className="home-main-container">
      <div className="home-header-container">
        <p className="p-home-ads">Объявления</p>
      </div>
      <div className="home-filters-container">
        <select className={`home-select-container ${filters.category ? 'active' : ''}`} value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
          <option value="">Все категории</option>
          {seedCategories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        
        <select className={`home-select-container ${filters.location ? 'active' : ''}`} value={filters.location} onChange={(e) => updateFilter('location', e.target.value)}>
          {seedLocations.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        <select className={`home-select-container ${filters.sort !== 'date-desc' ? 'active' : ''}`} value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
          {seedSortOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {authtrue && (
          <button type="button" className={`home-favorite-toggle ${filters.favoritesOnly ? 'active' : ''}`} onClick={() => updateFilter('favoritesOnly', !filters.favoritesOnly)}>
            Избранное {favorites.length > 0 && `(${favorites.length})`}
          </button>
        )}
        <button type="button" className='home-clear-button' onClick={handleClearFilters}>
          Очистить фильтры
        </button>
      </div>

      {visibleAds.length === 0 ? (
        <p className="p-home-empty">Ничего не найдено. Измените фильтры.</p>
      ) : (
        <div className="home-ads-container">
          {visibleAds.map((ad) => (
            <Link key={ad.id} to={`/adMain/${ad.id}`} className="ad-link">
              <AdComponent adId={ad.id} title={ad.title} price={ad.price} image={ad.image} location={seedLocations.find((i) => i.value===ad.location)?.label ?? ad.location} date={ad.createdAt} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;