import { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import './Notifications.css';
import { useNavigate } from 'react-router-dom';

function Notifications() {
  const { notifications, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();

  const handleClear = () => {
    clearAll();
    navigate('/');
  };

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

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
          {notifications.map((n) => (
            <div key={n.id} className="notifications-item">
              <p className="notifications-message">{n.message}</p>
              <span className="notifications-date">
                {new Date(n.createdAt).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;