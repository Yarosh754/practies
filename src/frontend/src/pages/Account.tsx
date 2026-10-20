import { useAuth } from "../contexts/AuthContext" 
import './Account.css';

function Account() {
  const {user, keycloak} = useAuth();

  const handleLogout = () =>{
    keycloak?.logout({ redirectUri: window.location.origin + '/' })
  }

  return (
    <div className="account-main-container">
      <div className="account-container">
        <p className="p-account">Аккаунт</p>
      </div>
      <div className="account-name-container">
        <p className="p-account-name">Имя: {user.firstName} {user.lastName}</p>
      </div>
      <div className="account-email-container">
        <p className="p-account-email">Email: {user.email}</p>
      </div>
      <div className="account-exit-container">
        <button onClick={handleLogout} className="account-exit-button">
          Выход
        </button>
      </div>
    </div>
  )
}

export default Account