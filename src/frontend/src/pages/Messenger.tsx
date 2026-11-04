import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdContext';
import { getApiErrorMessage } from '../api/helpers';
import type { components } from '../api/schema';
import './Messenger.css';
import ActiveChatMessenger from '../components/ActiveChatMessenger';
import ChatList from '../components/ChatList';

type Ad = components['schemas']['Ad'];

function Messenger() {
  const { user } = useAuth();
  const { getAd } = useAds();
  const {
    chats,
    loadingChats,
    getMessagesForChat,
    loadMessages,
    sendMessage,
  } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fallback, setFallback] = useState<{
    chatId: string;
    ad: Ad;
    otherUser: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  const activeChatId = searchParams.get('chatId');
  const activeChatInfo = chats.find((chat) => chat.chatId === activeChatId);

  useEffect(() => {
    if (activeChatInfo || !activeChatId || !user?.username) {
      return;
    }

    const [adId, user1, user2] = activeChatId.split('_');
    if (!adId || !user1 || !user2) return;

    let cancelled = false;

    getAd(adId)
      .then((ad) => {
        if (cancelled) return;
        setFallback({
          chatId: activeChatId,
          ad,
          otherUser: user1 === user.username ? user2 : user1,
        });
      })
      .catch((requestError) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(requestError));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeChatId, activeChatInfo, user?.username, getAd]);

  useEffect(() => {
    if (!activeChatId) return;

    loadMessages(activeChatId).catch((requestError) =>
      toast.error(getApiErrorMessage(requestError)),
    );
  }, [activeChatId, loadMessages]);

  const activeFallback =
    fallback?.chatId === activeChatId ? fallback : null;
  const displayAd = activeChatInfo?.ad ?? activeFallback?.ad;
  const displayOtherUser =
    activeChatInfo?.otherUser ?? activeFallback?.otherUser ?? '';
  const activeMessages = activeChatId
    ? getMessagesForChat(activeChatId)
    : [];

  const handleSendMessage = async (text: string) => {
    if (!activeChatId || sending) return;

    setSending(true);
    try {
      await sendMessage(activeChatId, text);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messenger-main">
      <ChatList chats={chats} activeChatId={activeChatId} loading={loadingChats} onSelectChat={(id) => setSearchParams({ chatId: id })}/>

      {activeChatId && displayAd ? (
        <ActiveChatMessenger ad={displayAd} otherUser={displayOtherUser} messages={activeMessages} sending={sending} onSendMessage={handleSendMessage} />
      ) : (
        <div className="messenger-chat-area">
          <div className="messenger-empty">
            Выберите чат, чтобы начать общение
          </div>
        </div>
      )}
    </div>
  );
}

export default Messenger;
