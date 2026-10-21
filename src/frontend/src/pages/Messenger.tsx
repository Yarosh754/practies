import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdContext';
import './Messenger.css';
import ActiveChatMessenger from '../components/ActiveChatMessenger';
import ChatList from '../components/ChatList';

function Messenger() {
  const { user } = useAuth();
  const { ads } = useAds();
  const { getChatsList, getMessagesForChat, sendMessage, markChatAsRead } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const chats = getChatsList();
  const activeChatId = searchParams.get('chatId');

  let activeChatInfo = chats.find((c) => c.chatId === activeChatId);
  let displayAd = activeChatInfo?.ad;
  let displayOtherUser = activeChatInfo?.otherUser;

  if (!displayAd && activeChatId && user) {
    const [adId, u1, u2] = activeChatId.split('_');
    displayAd = ads.find((a) => a.id === adId);
    displayOtherUser = u1 === user.username ? u2 : u1;
  }

  const activeMessages = activeChatId ? getMessagesForChat(activeChatId) : [];

  useEffect(() => {
    if (activeChatId) {
      markChatAsRead(activeChatId);
    }
  }, [activeChatId, activeMessages.length, markChatAsRead]);

  return (
    <div className="messenger-main">
      <ChatList chats={chats} activeChatId={activeChatId} onSelectChat={(id) => setSearchParams({ chatId: id })} />

      {activeChatId && displayAd ? (
        <ActiveChatMessenger ad={displayAd} otherUser={displayOtherUser!} messages={activeMessages} onSendMessage={(text) => sendMessage(activeChatId, text)} />
      ) : (
        <div className="messenger-chat-area">
          <div className="messenger-empty">Выберите чат, чтобы начать общение</div>
        </div>
      )}
    </div>
  );
}

export default Messenger;