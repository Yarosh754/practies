import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useChat } from '../contexts/ChatContext';
import './Header.css';

const PERSONAL_ACCOUNT = '/icons/personal-account.png';
const NOTICE = '/icons/notice.png';

function Header() {
  const { authtrue, user, keycloak } = useAuth();
  const navigate = useNavigate();
  const isAdmin = keycloak?.realmAccess?.roles.includes('admin');
  const { unreadCount } = useNotifications();
  const { totalUnreadMessages } = useChat();
  
  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <header>
      <div className="header-main-container">
        <div className="header-logo">
          <Link to='/'>Kufar</Link>
        </div>
        
        {authtrue && (
          <Link to="/notifications" className="header-notice">
            <img src={NOTICE} alt="Уведомления" className="header-notice-img" />
            {unreadCount > 0 && <span className="header-notice-badge">{unreadCount}</span>}
          </Link>
        )}
        
        <nav className="header-nav">
          {isAdmin && <Link to='/moderate'>Модерация</Link>}
          
          {authtrue && <Link to='/myAds'>Мои объявления</Link>}
          
          {authtrue && (
            <Link to='/messenger' className="header-message-link">
              Сообщения
              {totalUnreadMessages > 0 && (
                <span className="header-message-badge">{totalUnreadMessages}</span>
              )}
            </Link>
          )}
          
          <Link to='/'>Объявления</Link>
          
          <div className='header-buttons'>
            {authtrue && (
              <button className='header-createAd-button'>
                <Link to='/createAd'>Подать объявление</Link>
              </button>
            )}
            
            {!authtrue ? (
              <button className='header-login-button' onClick={handleLogin}>
                Вход
              </button>
            ) : (
              <Link to='/account' className="header-account-link">
                <img src={PERSONAL_ACCOUNT} alt="" className="header-account-img" />
                <div className='header-user'>{user.firstName}</div>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;