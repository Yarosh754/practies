import type { ChatListItem } from '../contexts/ChatContext';
import './Chat.css';

interface ChatProps {
  chat: ChatListItem;
  isActive: boolean;
  onClick: () => void;
}

function Chat({ chat, isActive, onClick }: ChatProps) {
  return (
    <div className={`chat-list-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="chat-image-container">
        <img src={chat.ad.images?.[0] || ''} className="chat-img" alt="" />
      </div>
      <div className="chat-info-container">
        <div className="chat-info-top">
          <p className="p-chat-name">{chat.otherUser}</p>
          <span className="p-chat-date">{chat.lastMessage.createdAt}</span>
        </div>
        <p className="p-chat-title">{chat.ad.title}</p>
        <p className="p-chat-last-message">{chat.lastMessage.text}</p>
      </div>
      {chat.unreadCount > 0 && (
        <div className="count-unread-message">{chat.unreadCount}</div>
      )}
    </div>
  );
}
export default Chat;