import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext'


function Header() {
  const {authtrue, user, keycloak} = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = () =>{
    navigate('/auth');
  }

  const handleLogout = () =>{
    keycloak?.logout({ redirectUri: window.location.origin + '/' })
  }

  return (
    <header>
        <div className="container-header">
            <div className="logo">Kufar</div>
            <nav className="nav">
                <Link to='/'>Объявления</Link>
                <Link to='/account'>Личный кабинет</Link>
                <div>
                    {!authtrue ? (
                        <button onClick={handleLogin}>
                            Вход
                        </button>) : 
                        <button onClick={handleLogout}>
                            Выход
                        </button>
                    }
                </div>
                {user && <div>{user.username}</div>}
            </nav>
        </div>
    </header>
  )
}

export default Header