import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Auth() {
  const { keycloak, authtrue } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authtrue) {
      navigate('/', { replace: true });
      return;
    }

    if (keycloak) {
      keycloak.login({ redirectUri: window.location.origin + '/' });
    }
  }, [keycloak, authtrue, navigate]);

  return <p>Перенаправление на страницу входа</p>;
}

export default Auth;