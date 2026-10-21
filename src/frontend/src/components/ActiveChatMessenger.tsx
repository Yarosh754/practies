import { useState, useEffect, useRef } from 'react';
import type { Ad, ChatMessage } from '../types';
import Message from './Message';
import './ActiveChatMessenger.css';

const SEND_MESSAGE = '/icons/send-message.png';

interface ActiveChatMessengerProps {
  ad: Ad;
  otherUser: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

function ActiveChatMessenger({ ad, otherUser, messages, onSendMessage }: ActiveChatMessengerProps) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="activechat-main-container">
      <div className="activechat-header">
        <p className="activechat-header-name">{otherUser}</p>
        <p className="activechat-header-ad">{ad.title}</p>
      </div>

      <div className="activechat-messages">
        {messages.length === 0 && (
          <p className="activechat-empty-message">Напишите первое сообщение</p>
        )}
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="activechat-input-container" onSubmit={handleSend}>
        <input type="text" className="activechat-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Напишите сообщение" />
        <button type="submit" className="activechat-send-button">
            <img src={SEND_MESSAGE} alt='' className="send-message-img" />
        </button>
      </form>
    </div>
  );
}

export default ActiveChatMessenger;