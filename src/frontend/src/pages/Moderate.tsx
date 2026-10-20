import { useAds } from "../contexts/AdContext";
import { Link, useNavigate } from "react-router-dom";
import AdComponent from "../components/AdComponent";
import { seedLocations } from "../storage/seedAd";
import { useAuth } from "../contexts/AuthContext";
import './Moderate.css';

function Moderate() {
  const { ads } = useAds();
  const { keycloak, authtrue } = useAuth();
  const isAdmin = keycloak?.realmAccess?.roles.includes('admin');
  const navigate = useNavigate();

  if (!authtrue || !isAdmin) {
    navigate('/')
  }

  const filters = ({
    status:'MODERATION',
    sort: 'date-asc'
  });

  let visibleAds = ads.filter((ad) => {
    if (filters.status && ad.status !== filters.status) return false;
    return true;
  });

  visibleAds = [...visibleAds].sort((a, b) => {return a.id.localeCompare(b.id);});

return (
      <div className="moderate-main-container">
        <div className="moderate-header-container">
          <p className="p-moderate-ads">Модерация</p>
        </div>

        {visibleAds.length === 0 ? (
          <p className="p-moderate-empty">Нет объявлений на модерацию.</p>
        ) : (
          <div className="moderate-ads-container">
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

export default Moderate