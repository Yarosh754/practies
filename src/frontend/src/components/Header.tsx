import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext'
import './Header.css';

const PERSONAL_ACCOUNT = '/icons/personal-account.png';
const NOTICE = '/icons/notice.png';

function Header() {
  const {authtrue, user, keycloak} = useAuth();
  const navigate = useNavigate();
  const isAdmin = keycloak?.realmAccess?.roles.includes('admin');
  
  const handleLogin = () =>{
    navigate('/auth');
  }

  const handleLogout = () =>{
    keycloak?.logout({ redirectUri: window.location.origin + '/' })
  }

  return (
    <header>
        <div className="header-main-container">
            <div className="header-logo">
                <Link to='/'>Kufar</Link>
            </div>
            {authtrue && (
                <button className='header-notice'>
                    <img src={NOTICE} alt=""  className="header-notice-img"/>
                </button>
            )}
            <nav className="header-nav">
                {isAdmin && <Link to='/moderate'>Модерация</Link>}
                {user && (
                    <Link to='/account'>
                        <img src={PERSONAL_ACCOUNT} alt=""  className="header-account-img"/>
                        <div className='header-user'>{user.firstName}</div>
                    </Link>
                )}
                {authtrue && <Link to='/myAds'>Мои объявления</Link>}
                {authtrue && <Link to='/'>Сообшения</Link>}
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
                        </button>) : 
                        <button className='header-logout-button' onClick={handleLogout}>
                            Выход
                        </button>
                    }
                </div>
            </nav>
        </div>
    </header>
  )
}

export default Header