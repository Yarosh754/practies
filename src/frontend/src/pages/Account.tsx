import { useAuth } from "../contexts/AuthContext" 

function Account() {
  const {user, keycloak} = useAuth();

  return (
    <div className="account-main-container">
        <h2>Аккаунт</h2>
        <div>
          <p>Роль: {keycloak?.realmAccess?.roles.join(', ')}</p>
          <p>ID: {user.id}</p>
          <p>Логин: {user.username}</p>
          <p>Имя: {user.firstName} {user.lastName}</p>
          <p>Email: {user.email}</p>
        </div>
    </div>
  )
}

export default Account