import { useEffect } from 'react';
import { toast } from 'sonner';
import { useNotifications } from '../contexts/NotificationsContext';
import { getApiErrorMessage } from '../api/helpers';
import './Notifications.css';
import { useNavigate, Link } from 'react-router-dom';

function Notifications() {
  const { notifications, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const handleClear = async () => {
    try {
      await clearAll();
      navigate('/');
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    }
  };

  useEffect(() => {
    if (unreadCount === 0) return;

    markAllAsRead().catch((requestError) =>
      toast.error(getApiErrorMessage(requestError)),
    );
  }, [unreadCount, markAllAsRead]);

  return (
    <div className="notifications-main-container">
      <div className="notifications-header">
        <h1 className="p-notifications-title">Уведомления</h1>
        {notifications.length > 0 && (
          <button className="notifications-clear-btn" onClick={handleClear}>Очистить все</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="notifications-empty">У вас пока нет уведомлений.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div key={notification.id} className="notifications-item">
              {notification.link ? (
                <Link to={notification.link} className="notifications-message-link">
                  <p className="notifications-message">{notification.message}</p>
                </Link>
              ) : (
                <p className="notifications-message">{notification.message}</p>
              )}
              <span className="notifications-date">
                {new Date(notification.createdAt).toLocaleString('ru-RU', {hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short',})}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
