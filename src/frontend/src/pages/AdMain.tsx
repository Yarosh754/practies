import { useEffect, useState } from 'react';
import './AdMain.css';
import Favorites from '../components/Favorites';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdContext';
import { useDictionaries } from '../contexts/DictionariesContext';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';
import ImageComponent from '../components/ImageComponent';
import { getApiErrorMessage } from '../api/helpers';
import { statusLabels } from '../constants/filters';
import type { components } from '../api/schema';

type Ad = components['schemas']['Ad'];

const BUTTON_RIGHT = '/icons/button-right.png';
const BUTTON_LEFT = '/icons/button-left.png';

function AdMain() {
  const [indexPhoto, setIndexPhoto] = useState(0);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const { getAd, changeStatus, moderate } = useAds();
  const { user, authtrue, keycloak } = useAuth();
  const { getLocationLabel } = useDictionaries();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getAd(id)
      .then((data) => {
        if (!cancelled) {
          setAd(data);
          setIndexPhoto(0);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setAd(null);
          setError(
            getApiErrorMessage(
              requestError,
              'Объявление не найдено или скрыто.',
            ),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, getAd]);

  const isAdmin = Boolean(keycloak?.realmAccess?.roles?.includes('admin'));
  const isOwner = Boolean(authtrue && user?.username === ad?.authorId);

  const changePhotoLeft = () => {
    if (!ad || ad.images.length <= 1) return;
    setIndexPhoto((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1));
  };

  const changePhotoRight = () => {
    if (!ad || ad.images.length <= 1) return;
    setIndexPhoto((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1));
  };

  const openPhone = () => {
    if (!authtrue) {
      navigate('/auth');
      return;
    }
    setPhoneOpen(true);
  };

  const handleSoldAd = async () => {
    if (!ad) return;
    try {
      const updated = await changeStatus(ad.id, 'SOLD');
      setAd(updated);
      toast.success(`Объявление "${ad.title}" продано`);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    }
  };

  const handleDeleteAd = async () => {
    if (!ad || !confirm('Удалить объявление?')) return;
    try {
      await changeStatus(ad.id, 'DELETE');
      toast.success(`Объявление "${ad.title}" удалено`);
      navigate('/myAds');
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    }
  };

  const handleModerate = async (decision: 'approve' | 'reject') => {
    if (!ad) return;
    try {
      await moderate(ad.id, decision);
      toast.success(
        decision === 'approve'
          ? `Объявление "${ad.title}" прошло модерацию и опубликовано`
          : `Объявление "${ad.title}" не прошло модерацию и было отклонено`,
      );
      navigate('/moderate');
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    }
  };

  const handleMessage = () => {
    if (!authtrue) {
      navigate('/auth');
      return;
    }
    if (!ad || !user?.username) return;
    if (ad.authorId === user.username) return;

    const users = [user.username, ad.authorId].sort().join('_');
    const chatId = `${ad.id}_${users}`;
    navigate(`/messenger?chatId=${chatId}`);
  };

  if (loading) {
    return (
      <div className='adMain-main-container'>
        <p className="adMain-notfound">Загрузка...</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className='adMain-main-container'>
        <p className="adMain-notfound">
          {error ?? 'Объявление не найдено или скрыто.'}
        </p>
      </div>
    );
  }

  const arrayPhoto = ad.images || [];

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
        {ad.status !== 'ACTIVE' && statusLabels[ad.status] && (
          <div className={`adMain-status-badge status-${ad.status.toLowerCase()}`}>
            {statusLabels[ad.status]}
          </div>
        )}

        <div className='adMain-name'>
          <p className='p-adMain-name'>{ad.title}</p>
        </div>
        <div className='adMain-price'>
          <p className='p-adMain-price'>{ad.price}$</p>
        </div>
        <div className='adMain-location'>
          <p className='p-adMain-location'>{getLocationLabel(ad.location)}</p>
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
              <button type='button' className='adMain-sold-button' onClick={handleSoldAd}>
                Продал
              </button>
              <button type='button' className='adMain-delete-button' onClick={handleDeleteAd}>
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
              <button type='button' className='adMain-confirm-button' onClick={() => handleModerate('approve')}>
                Принять
              </button>
              <button type='button' className='adMain-noconfirm-button' onClick={() => handleModerate('reject')}>
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
