import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';
import { AdProvider } from './contexts/AdContext';
import { FavoritesProvider } from './contexts/FavoriteContext';
import { Toaster } from 'sonner';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ChatProvider } from './contexts/ChatContext';
import { DictionariesProvider } from './contexts/DictionariesContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdProvider>
          <DictionariesProvider>
            <NotificationsProvider>
              <ChatProvider>
                <FavoritesProvider>
                  <App />
                  <Toaster position="bottom-right" richColors />
                </FavoritesProvider>
              </ChatProvider>
            </NotificationsProvider>
          </DictionariesProvider>
        </AdProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
