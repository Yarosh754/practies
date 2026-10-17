import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';
import { AdProvider } from './contexts/AdContext';
import { FavoritesProvider } from './contexts/FavoriteContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </AdProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);