import type React from 'react';
import './Favorites.css';
import { useFavorites } from '../contexts/FavoriteContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HEART_OFF = '/icons/heart-off.png';
const HEART_ON  = '/icons/heart-on.png';

interface Favorite {
  adId: string; 
}

function Favorite({ adId }: Favorite) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const {authtrue} = useAuth();
  const active = isFavorite(adId); 
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authtrue) {
      navigate('/auth');
      return;
    }

    toggleFavorite(adId);
  };

  return (
    <button type="button" className="favorites-button" onClick={handleClick}>
      <img src={active ? HEART_ON : HEART_OFF} alt='' className="favorites-img" />
    </button>
  );
}

export default Favorite;