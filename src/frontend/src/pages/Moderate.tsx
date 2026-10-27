import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import AdComponent from "../components/AdComponent";
import { seedLocations, seedStatus } from "../storage/seedAd";
import { useAuth } from "../contexts/AuthContext";
import { useAds } from "../contexts/AdContext";
import './Moderate.css';

function Moderate() {
  const { ads } = useAds();
  const { keycloak, authtrue } = useAuth();
  const isAdmin = keycloak?.realmAccess?.roles.includes('admin');
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('MODERATION');

  if (!authtrue || !isAdmin) {
    navigate('/');
    return null;
  }

  const adminStatus = seedStatus.filter((s) => 
    ['MODERATION', 'REJECTED', 'SOLD'].includes(s.value)
  );

  const isDefault = statusFilter === 'MODERATION';

  const handleClear = () => {
    setStatusFilter('MODERATION');
  };

  let visibleAds = ads.filter((ad) => {
    if (ad.status !== statusFilter) return false;
    return true;
  });

  visibleAds = [...visibleAds].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="moderate-main-container">
      <div className="moderate-header-container">
        <p className="p-moderate-ads">Модерация</p>
      </div>

      <div className="moderate-filters-container">
        <select className={`moderate-select-container ${!isDefault ? 'active' : ''}`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {adminStatus.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {!isDefault && (
          <button type="button" className="moderate-clear-button" onClick={handleClear}>
            Очистить фильтр
          </button>
        )}
      </div>

      {visibleAds.length === 0 ? (
        <p className="p-moderate-empty">Нет объявлений с таким статусом.</p>
      ) : (
        <div className="moderate-ads-container">
          {visibleAds.map((ad) => (
            <Link key={ad.id} to={`/adMain/${ad.id}`} className="ad-link">
              <AdComponent adId={ad.id} title={ad.title} price={ad.price} image={ad.images?.[0] || ''} location={seedLocations.find((i) => i.value === ad.location)?.label ?? ad.location} date={ad.createdAt} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Moderate;