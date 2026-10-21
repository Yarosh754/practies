import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage } from '../types';
import './Message.css';

interface MessageProps {
  message: ChatMessage;
}

function Message({ message }: MessageProps) {
  const { user } = useAuth();
  const isSender = message.senderId === user?.username;

  return (
    <div className={`message-main-container ${isSender ? 'message-sender' : 'message-other'}`}>
      <div className="message-container">
        <p className="message-text">{message.text}</p>
        <span className="message-time">{message.createdAt}</span>
      </div>
    </div>
  );
}
export default Message;