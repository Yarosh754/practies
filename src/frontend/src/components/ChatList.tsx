import type { components } from '../api/schema';
import Chat from './Chat';
import './ChatList.css';

type ChatListItem = components['schemas']['ChatListItem'];

interface ChatsListProps {
  chats: ChatListItem[];
  activeChatId: string | null;
  loading: boolean;
  onSelectChat: (chatId: string) => void;
}

function ChatList({
  chats,
  activeChatId,
  loading,
  onSelectChat,
}: ChatsListProps) {
  return (
    <div className="chatlist-main-container">
      <h2 className="chatlist-title">Сообщения</h2>
      <div className="chatlist-chat">
        {loading ? (
          <p className="chatlist-empty">Загрузка...</p>
        ) : chats.length === 0 ? (
          <p className="chatlist-empty">Нет чатов</p>
        ) : (
          chats.map((chat) => (
            <Chat key={chat.chatId} chat={chat} isActive={chat.chatId === activeChatId} onClick={() => onSelectChat(chat.chatId)}/>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;