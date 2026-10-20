import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { loadFromStorage, saveToStorage } from '../storage/storage';
import type { Notification } from '../types';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (targetUsername: string, message: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const currentUsername = user?.username ?? null; 

  const [allNotifications, setAllNotifications] = useState<Notification[]>(() =>
    loadFromStorage<Notification[]>('notifications', []),
  );

  useEffect(() => {
    saveToStorage('notifications', allNotifications);
  }, [allNotifications]);

  const notifications = currentUsername ? allNotifications
        .filter((n) => n.username === currentUsername)
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((targetUsername: string, message: string) => {
    const newNotification: Notification = {
      id: String(Date.now() + Math.random()),
      username: targetUsername,
      message,
      createdAt: Date.now(),
      read: false,
    };
    setAllNotifications((prev) => [...prev, newNotification]);
  }, []);

  const markAllAsRead = useCallback(() => {
    if (!currentUsername) return;
    setAllNotifications((prev) =>
      prev.map((n) => (n.username === currentUsername ? { ...n, read: true } : n)),
    );
  }, [currentUsername]);

  const clearAll = useCallback(() => {
    if (!currentUsername) return;
    setAllNotifications((prev) => prev.filter((n) => n.username !== currentUsername));
  }, [currentUsername]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
};