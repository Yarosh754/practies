import { useEffect, useState } from 'react'
import './AdMain.css';
import Favorites from '../components/Favorites';
import { useAds } from '../contexts/AdContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { seedLocations } from '../storage/seedAd';
import { useNotifications } from '../contexts/NotificationsContext';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';
import ImageComponent from '../components/ImageComponent';

const BUTTON_RIGHT = '/icons/button-right.png';
const BUTTON_LEFT = '/icons/button-left.png';

const STATUS: Record<string, string> = {
  MODERATION: 'На модерации',
  SOLD: 'Продано',
  DELETE: 'Удалено',
  REJECTED: 'Отклонено',
};

function AdMain() {
  const [indexPhoto, setIndexPhoto] = useState(0);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { ads, changeStatus } = useAds();
  const { user, authtrue, keycloak } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIndexPhoto(0);
  }, [id]);

  const ad = ads.find((i) => i.id === id);
  const { addNotification } = useNotifications();

  const isAdmin = keycloak?.realmAccess?.roles.includes('admin');
  const isOwner = authtrue && user?.username === ad?.authorId;
  const canView = ad && (ad.status === 'ACTIVE' || ad.status === 'SOLD' || isAdmin || isOwner);

  if (!ad || !canView) {
    return (
      <div className='adMain-main-container'>
        <p className="adMain-notfound">Объявление не найдено или скрыто.</p>
      </div>
    );
  }

  const arrayPhoto = ad.images || [];

  const changePhotoLeft = () => {
    if (arrayPhoto.length <= 1) return;
    setIndexPhoto((prev) => (prev === 0 ? arrayPhoto.length - 1 : prev - 1));
  };

  const changePhotoRight = () => {
    if (arrayPhoto.length <= 1) return;
    setIndexPhoto((prev) => (prev === arrayPhoto.length - 1 ? 0 : prev + 1));
  };

  const openPhone = () => {
    if (!authtrue) navigate('/auth');
    setPhoneOpen(true);
  };

  const handleSoldAd = (adId: string) => {
    changeStatus(adId, 'SOLD');
    const message = `Объявление "${ad.title}" продано`;
    toast.success(message);
    addNotification(user.username, message, `/adMain/${adId}`);
  };

  const handleDeleteAd = (adId: string) => {
    if (!confirm('Удалить объявление?')) return;
    changeStatus(adId, 'DELETE');
    const message = `Объявление "${ad.title}" удалено`;
    toast.success(message);
    addNotification(user.username, message, `/adMain/${adId}`);
    navigate('/myAds');
  };

  const handleApprove = (adId: string, author: string) => {
    changeStatus(adId, 'ACTIVE');
    const message = `Объявление "${ad.title}" прошло модерацию и опубликовано`;
    toast.success(message);
    addNotification(author, message, `/adMain/${adId}`);
    navigate('/moderate');
  };

  const handleNotApprove = (adId: string, author: string) => {
    changeStatus(adId, 'REJECTED');
    const message = `Объявление "${ad.title}" не прошло модерацию и было отклонено`;
    toast.success(message);
    addNotification(author, message, `/adMain/${adId}`);
    navigate('/moderate');
  };

  const handleMessage = () => {
    if (!authtrue) navigate('/auth');
    if (!ad) return;
    const users = [user.username, ad.authorId].sort().join('_');
    const chatId = `${ad.id}_${users}`;
    navigate(`/messenger?chatId=${chatId}`);
  };

  return (
    <div className='adMain-main-container'>
      <div className='adMain-image-container'>
        <div className='adMain-heart'>
          <Favorites adId={ad.id} />
        </div>
        {arrayPhoto.length > 1 && (
          <button className='adMain-button-left' onClick={changePhotoLeft}>
            <img src={BUTTON_LEFT} alt="" className="adMain-button-left-img" />
          </button>
        )}
        <ImageComponent src={arrayPhoto[indexPhoto] || ''} className="adMain-img" /> 
        {arrayPhoto.length > 1 && (
          <button className='adMain-button-right' onClick={changePhotoRight}>
            <img src={BUTTON_RIGHT} alt="" className="adMain-button-right-img" />
          </button>
        )}
      </div>
      
      <div className='adMain-info-container'>
        {ad.status !== 'ACTIVE' && STATUS[ad.status] && (
          <div className={`adMain-status-badge status-${ad.status.toLowerCase()}`}>
            {STATUS[ad.status]}
          </div>
        )}

        <div className='adMain-name'>
          <p className='p-adMain-name'>{ad.title}</p>
        </div>
        <div className='adMain-price'>
          <p className='p-adMain-price'>{ad.price}$</p>
        </div>
        <div className='adMain-location'>
          <p className='p-adMain-location'>{seedLocations.find((l) => l.value === ad.location)?.label ?? ad.location}</p>
        </div>
        <div className='adMain-date'>
          <p className='p-adMain-date'>{formatDate(ad.createdAt)}</p>
        </div>
        <div className='adMain-discription'>
          <p className='p-adMain-discription'>Описание</p>
          <p className='p-adMain-discription-text'>{ad.description}</p>
        </div>
        <div className='adMain-author'>
          <p className='p-adMain-author'>Продавец: <span>{ad.authorId}</span></p>
        </div>

        {ad.status === 'ACTIVE' && (
          <div className='adMain-buttons'>
            <button onClick={openPhone} type='button' className='adMain-button-phone'>Позвонить</button>
            {ad.authorId !== user?.username && (
              <button type='button' className='adMain-button-message' onClick={handleMessage}>Написать</button>
            )}
          </div>
        )}

        {isOwner && ad.status === 'ACTIVE' && (
          <div className='adMain-owner'>
            <p className='p-adMain-owner-title'>Мои действия</p>
            <div className='adMain-owner-buttons'>
              <button type='button' className='adMain-sold-button' onClick={() => handleSoldAd(ad.id)}>
                Продал
              </button>
              <button type='button' className='adMain-delete-button' onClick={() => handleDeleteAd(ad.id)}>
                Удалить
              </button>
              <Link to={`/createad/${ad.id}`} className="adMain-edit-link">
                Редактировать
              </Link>
            </div>
          </div>
        )}

        {isAdmin && ad.status === 'MODERATION' && (
          <div className='adMain-admin'>
            <p className='p-adMain-admin-title'>Модерация</p>
            <div className='adMain-admin-buttons'>
              <button type='button' className='adMain-confirm-button' onClick={() => handleApprove(ad.id, ad.authorId)}>
                Принять
              </button>
              <button type='button' className='adMain-noconfirm-button' onClick={() => handleNotApprove(ad.id, ad.authorId)}>
                Отклонить
              </button>
            </div>
          </div>
        )}

        {phoneOpen && (
          <div className="adMain-modal-container" onClick={() => setPhoneOpen(false)}>
            <div className="adMain-modal" onClick={(e) => e.stopPropagation()}>
              <p className='p-adMain-modal'>Контактные данные</p>
              <div className="adMain-modal-row">
                <span className="adMain-modal-label">Имя</span>
                <span className="adMain-modal-value">{ad.authorId}</span>
              </div>
              <div className="adMain-modal-row">
                <span className="adMain-modal-label">Телефон</span>
                <a href={`tel:${ad.phone.replace(/[^+\d]/g, '')}`} className="adMain-modal-value adMain-modal-phone-number">
                  {ad.phone}
                </a>
              </div>
              <button type="button" className="adMain-modal-close-button" onClick={() => setPhoneOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdMain