import { useState } from 'react'
import './AdMain.css';
import Favorites from '../components/Favorites';
import { useAds } from '../contexts/AdContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { seedLocations } from '../storage/seedAd';

const BUTTON_RIGHT = '/icons/button-right.png';
const BUTTON_LEFT = '/icons/button-left.png';

function AdMain() {
  const [indexPhoto, setIndexPhoto] = useState(0);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const {id} = useParams<{id: string}>();
  const {ads, changeStatus} = useAds();
  const {user, authtrue, keycloak} = useAuth();
  const navigate = useNavigate();
  const isAdmin = keycloak?.realmAccess?.roles.includes('admin');

  const ad = ads.find((i) => i.id === id);

  const arrayPhoto = [BUTTON_LEFT];
  
  const changePhotoLeft = () =>{
    if(indexPhoto===0){
        setIndexPhoto(3)
    }
    else {
        setIndexPhoto(indexPhoto-1)
    }
  }
  
  const changePhotoRight = () =>{
    if(indexPhoto===arrayPhoto.length-1){
        setIndexPhoto(0)
    }
    else {
        setIndexPhoto(indexPhoto+1)
    }
  }

  const openPhone = () =>{
    if(!authtrue) navigate('/auth');
    setPhoneOpen(true)
  }

  const handleDeleteAd = (adId: string) => {
    if (!confirm('Удалить объявление?')) return;
    changeStatus(adId, 'DELETE'); 
    navigate('/myAds');
  };

  if (!ad) {
    return (
        <div className='adMain-main-container'>
        <p>Объявление не найдено.</p>
        </div>
    );
  }

  return (
    <div className='adMain-main-container'>
        <div className='adMain-image-container'>
            <div className='adMain-heart'>
                <Favorites adId={ad.id}/>
            </div>
            <button className='adMain-button-left' onClick={changePhotoLeft}>
                <img src={BUTTON_LEFT} alt=""  className="adMain-button-left-img"/>
            </button>
            <img 
              src={arrayPhoto[indexPhoto]} 
              className="adComponent-img"
              alt=""
            />
            <button className='adMain-button-right' onClick={changePhotoRight}>
                <img src={BUTTON_RIGHT} alt=""  className="adMain-button-right-img"/>
            </button>
        </div>
        <div className='adMain-info-container'>
            <div className='adMain-name'>
                <p className='p-adMain-name'>{ad.title}</p>
            </div>
            <div className='adMain-price'>
                <p className='p-adMain-price'>{ad.price}</p>
            </div>
            <div className='adMain-location'>
                <p className='p-adMain-location'>{seedLocations.find((l) => l.value === ad.location)?.label ?? ad.location}</p>
            </div>
            <div className='adMain-date'>
                <p className='p-adMain-date'>{ad.createdAt}</p>
            </div>
            <div className='adMain-discription'>
                <p className='p-adMain-discription'>Описание</p>
                <p className='p-adMain-discription-text'>{ad.description}</p>
            </div>
            {ad.status ==='ACTIVE' &&(
                <div className='adMain-buttons'>
                    <button onClick={openPhone} type='button' className='adMain-button-phone'>Позвонить</button>
                    {ad.authorId === user?.username && (<button type='button' className='adMain-button-message'>Написать</button>)}
                </div>
            )}

            {authtrue && ad.authorId === user?.username &&(
                <div className='adMain-owner'>
                    <p className='p-adMain-owner-title'>Мои действия</p>
                    <div className='adMain-owner-buttons'>
                        {ad.status === 'ACTIVE' && (
                            <button type='button' className='adMain-sold-button' onClick={() => changeStatus(ad.id, 'SOLD')}>
                                Продал
                            </button>
                        )}

                        <button type='button' className='adMain-delete-button' onClick={() => handleDeleteAd(ad.id)}>
                            Удалить
                        </button>

                        <Link to={`/createad/${ad.id}`} className="adMain-edit-link">
                            Редактировать
                        </Link>
                    </div>
                </div>
            )}

            {authtrue && isAdmin && ad.status ==='MODERATION' &&(
                <div className='adMain-admin'>
                    <p className='p-adMain-admin-title'>Модерация</p>
                    <div className='adMain-admin-buttons'>
                        <button type='button' className='adMain-confirm-button' onClick={() => {changeStatus(ad.id, 'ACTIVE'); navigate('/moderate')}}>
                            Принять
                        </button>
                        <button type='button' className='adMain-noconfirm-button' onClick={() => {changeStatus(ad.id , 'REJECTED'); navigate('/moderate')}}>
                            Отклонить
                        </button>
                    </div>
                </div>
            )}

            {phoneOpen &&(
                <div className="adMain-modal-container" onClick={() => setPhoneOpen(false)} >
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
            </div>)}
        </div>
    </div>
  )
}

export default AdMain