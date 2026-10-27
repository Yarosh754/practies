import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useAds } from './AdContext';
import { useNotifications } from './NotificationsContext';
import { loadFromStorage, saveToStorage } from '../storage/storage';
import type { ChatMessage, Ad } from '../types';

export interface ChatListItem {
  chatId: string;
  ad: Ad;
  otherUser: string;
  lastMessage: ChatMessage;
  unreadCount: number;
}

interface ChatContextType {
  messages: ChatMessage[];
  totalUnreadMessages: number;
  sendMessage: (chatId: string, text: string) => void;
  markChatAsRead: (chatId: string) => void;
  getMessagesForChat: (chatId: string) => ChatMessage[];
  getChatsList: () => ChatListItem[];
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  totalUnreadMessages: 0,
  sendMessage: () => {},
  markChatAsRead: () => {},
  getMessagesForChat: () => [],
  getChatsList: () => [],
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { ads } = useAds();
  const { addNotification } = useNotifications();
  const currentUsername = user?.username ?? null;

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage<ChatMessage[]>('messages', []),
  );

  useEffect(() => {
    saveToStorage('messages', messages);
  }, [messages]);

  const totalUnreadMessages = messages.filter((m) => {
    if (!currentUsername || m.senderId === currentUsername || m.isRead) return false;
    
    const parts = m.chatId.split('_');
    const isParticipant = parts[1] === currentUsername || parts[2] === currentUsername;
    
    return isParticipant;
  }).length;

  const sendMessage = useCallback((chatId: string, text: string) => {
    if (!currentUsername) return;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      chatId,
      senderId: currentUsername,
      text,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);

    const [adId, user1, user2] = chatId.split('_');
    const recipient = user1 === currentUsername ? user2 : user1;
    const ad = ads.find(a => a.id === adId);
    
    if (ad) {
      const message = `Новое сообщение по объявлению "${ad.title}" от ${currentUsername}`;
      addNotification(recipient, message, `/messenger?chatId=${chatId}`);
    }
  }, [currentUsername, ads, addNotification]);

  const markChatAsRead = useCallback((chatId: string) => {
    if (!currentUsername) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.chatId === chatId && m.senderId !== currentUsername ? { ...m, isRead: true } : m
      )
    );
  },[currentUsername]);

  const getMessagesForChat = useCallback((chatId: string) => {
    return messages
        .filter((m) => m.chatId === chatId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },[messages]);

  const getChatsList = useCallback((): ChatListItem[] => {
    if (!currentUsername) return [];

    const myMessages = messages.filter((m) => {
        const parts = m.chatId.split('_');
        return parts[1] === currentUsername || parts[2] === currentUsername;
    });

    const chatsMap = new Map<string, ChatMessage[]>();
    myMessages.forEach((m) => {
      if (!chatsMap.has(m.chatId)) chatsMap.set(m.chatId, []);
      chatsMap.get(m.chatId)!.push(m);
    });

    const chatItems: ChatListItem[] = [];
    chatsMap.forEach((msgs, chatId) => {
      const [adId, seller, buyer] = chatId.split('_');
      const ad = ads.find((a) => a.id === adId);
      if (!ad) return;

      const sortedMsgs = msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastMessage = sortedMsgs[0];
      const otherUser = seller === currentUsername ? buyer : seller;
      const unreadCount = msgs.filter((m) => m.senderId !== currentUsername && !m.isRead).length;

      chatItems.push({ chatId, ad, otherUser, lastMessage, unreadCount });
    });

    return chatItems.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  },[messages,ads,currentUsername]);

  return (
    <ChatContext.Provider value={{ messages, totalUnreadMessages, sendMessage, markChatAsRead, getMessagesForChat, getChatsList }}>
      {children}
    </ChatContext.Provider>
  );
};