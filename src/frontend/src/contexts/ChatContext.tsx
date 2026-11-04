import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode,} from 'react';
import { apiClient } from '../api/client';
import { getApiErrorMessage } from '../api/helpers';
import type { components } from '../api/schema';
import { useAuth } from './AuthContext';

type ChatListItem = components['schemas']['ChatListItem'];
type ChatMessage = components['schemas']['ChatMessage'];

interface ChatContextType {
  chats: ChatListItem[];
  totalUnreadMessages: number;
  loadingChats: boolean;
  reloadChats: () => Promise<void>;
  getMessagesForChat: (chatId: string) => ChatMessage[];
  loadMessages: (chatId: string) => Promise<ChatMessage[]>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat должен использоваться внутри ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { keycloak, authtrue } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [loadingChats, setLoadingChats] = useState(false);

  const reloadChats = useCallback(async () => {
    if (!keycloak?.token) {
      setChats([]);
      return;
    }

    setLoadingChats(true);
    try {
      const { data, error } = await apiClient.GET('/chats', {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      if (error) throw new Error(getApiErrorMessage(error));
      setChats(data ?? []);
    } finally {
      setLoadingChats(false);
    }
  }, [keycloak]);

  useEffect(() => {
    if (!authtrue) {
      setChats([]);
      setMessagesByChat({});
      return;
    }

    reloadChats().catch((error) =>
      console.error('Failed to load chats:', error),
    );
  }, [authtrue, reloadChats]);

  const loadMessages = useCallback(
    async (chatId: string) => {
      if (!keycloak?.token) throw new Error('Требуется авторизация');

      const { data, error } = await apiClient.GET(
        '/chats/{chatId}/messages',
        {
          params: { path: { chatId } },
          headers: { Authorization: `Bearer ${keycloak.token}` },
        },
      );
      if (error) throw new Error(getApiErrorMessage(error));

      const messages = data ?? [];
      setMessagesByChat((previous) => ({ ...previous, [chatId]: messages }));
      setChats((previous) =>
        previous.map((chat) =>
          chat.chatId === chatId ? { ...chat, unreadCount: 0 } : chat,
        ),
      );

      return messages;
    },
    [keycloak],
  );

  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      if (!keycloak?.token) throw new Error('Требуется авторизация');

      const { data, error } = await apiClient.POST(
        '/chats/{chatId}/messages',
        {
          params: { path: { chatId } },
          body: { text },
          headers: { Authorization: `Bearer ${keycloak.token}` },
        },
      );
      if (error) throw new Error(getApiErrorMessage(error));
      if (!data) throw new Error('Не удалось отправить сообщение');

      setMessagesByChat((previous) => ({
        ...previous,
        [chatId]: [...(previous[chatId] ?? []), data],
      }));

      await reloadChats().catch(() => undefined);
    },
    [keycloak, reloadChats],
  );

  const getMessagesForChat = useCallback(
    (chatId: string) => messagesByChat[chatId] ?? [],
    [messagesByChat],
  );

  const totalUnreadMessages = chats.reduce(
    (total, chat) => total + chat.unreadCount,
    0,
  );

  const contextValue = useMemo(
    () => ({
      chats,
      totalUnreadMessages,
      loadingChats,
      reloadChats,
      getMessagesForChat,
      loadMessages,
      sendMessage,
    }),
    [
      chats,
      totalUnreadMessages,
      loadingChats,
      reloadChats,
      getMessagesForChat,
      loadMessages,
      sendMessage,
    ],
  );

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};
