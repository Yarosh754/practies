import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode,} from 'react';
import { apiClient } from '../api/client';
import { getApiErrorMessage } from '../api/helpers';
import type { components } from '../api/schema';
import { useAuth } from './AuthContext';

type Notification = components['schemas']['Notification'];

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  reload: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationsContext =
  createContext<NotificationsContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      'useNotifications должен использоваться внутри NotificationsProvider',
    );
  }
  return context;
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { keycloak, authtrue } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!keycloak?.token) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await apiClient.GET('/notifications', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      if (error) throw new Error(getApiErrorMessage(error));
      setNotifications(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [keycloak]);

  useEffect(() => {
    if (!authtrue) {
      setNotifications([]);
      return;
    }

    reload().catch((error) =>
      console.error('Failed to load notifications:', error),
    );
  }, [authtrue, reload]);

  useEffect(() => {
    if (!authtrue) return;

    const intervalId = window.setInterval(() => {
      reload().catch(() => undefined);
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, [authtrue, reload]);

  const markAllAsRead = useCallback(async () => {
    if (!keycloak?.token) return;

    const { error } = await apiClient.PATCH('/notifications/read', {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    });
    if (error) throw new Error(getApiErrorMessage(error));

    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, read: true })),
    );
  }, [keycloak]);

  const clearAll = useCallback(async () => {
    if (!keycloak?.token) return;

    const { error } = await apiClient.DELETE('/notifications', {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    });
    if (error) throw new Error(getApiErrorMessage(error));

    setNotifications([]);
  }, [keycloak]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const contextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      reload,
      markAllAsRead,
      clearAll,
    }),
    [notifications, unreadCount, loading, reload, markAllAsRead, clearAll],
  );

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};
