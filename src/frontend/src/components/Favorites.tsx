import type React from 'react';
import { toast } from 'sonner';
import './Favorites.css';
import { getApiErrorMessage } from '../api/helpers';
import { useFavorites } from '../contexts/FavoriteContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HEART_OFF = '/icons/heart-off.png';
const HEART_ON = '/icons/heart-on.png';

interface FavoriteProps {
  adId: string;
}

function Favorite({ adId }: FavoriteProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { authtrue } = useAuth();
  const active = isFavorite(adId);
  const navigate = useNavigate();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authtrue) {
      navigate('/auth');
      return;
    }

    try {
      await toggleFavorite(adId);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <button type="button" className="favorites-button" onClick={handleClick} aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}>
      <img src={active ? HEART_ON : HEART_OFF} alt="" className="favorites-img" />
    </button>
  );
}

export default Favorite;