import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Keycloak from 'keycloak-js';

interface AuthContextType {
  keycloak: Keycloak | null;
  authtrue: boolean;
  user: any;
}

const AuthContext = createContext<AuthContextType>({
  keycloak: null,
  authtrue: false,
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authtrue, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const kc = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    });

    kc.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })
      .then((auth) => {
        setKeycloak(kc);
        setAuthenticated(auth);

        if (auth && kc.tokenParsed) {
          setUser({
            id: kc.tokenParsed.sub,
            username: kc.tokenParsed.preferred_username,
            firstName: kc.tokenParsed.given_name,
            lastName: kc.tokenParsed.family_name,
            email: kc.tokenParsed.email,
          });
        }
      })
      .catch((err) => console.error('Keycloak init failed:', err));
  }, []);

  return (
    <AuthContext.Provider value={{ keycloak, authtrue, user }}>
      {children}
    </AuthContext.Provider>
  );
};