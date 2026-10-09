import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Auth() {
  const { keycloak } = useAuth();

  useEffect(() => {
    if (keycloak) {
      keycloak.login({ redirectUri: window.location.origin + '/' });
    }
  }, [keycloak]);

  return <p>Auth</p>;
}

export default Auth;