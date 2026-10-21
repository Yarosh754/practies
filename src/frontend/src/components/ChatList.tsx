import type { ChatListItem } from '../contexts/ChatContext';
import Chat from './Chat';
import './ChatList.css';

interface ChatsListProps {
  chats: ChatListItem[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

function ChatList({ chats, activeChatId, onSelectChat }: ChatsListProps) {
  return (
    <div className="chatlist-main-container">
      <h2 className="chatlist-title">Сообщения</h2>
      <div className="chatlist-chat">
        {chats.length === 0 ? (
          <p className="chatlist-empty">Нет чатов</p>
        ) : (
          chats.map((chat) => (
            <Chat key={chat.chatId} chat={chat} isActive={chat.chatId === activeChatId} onClick={() => onSelectChat(chat.chatId)} />
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;