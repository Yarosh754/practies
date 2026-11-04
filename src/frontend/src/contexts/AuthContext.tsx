import { createContext, useContext, useEffect,useState,type ReactNode,} from 'react';
import Keycloak from 'keycloak-js';

export type AuthUser = {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

interface AuthContextType {
  keycloak: Keycloak | null;
  authtrue: boolean;
  user: AuthUser | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const kc = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    });

    kc.onTokenExpired = () => {
      kc.updateToken(30).catch(() => {
        setAuthenticated(false);
        setUser(null);
      });
    };

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
