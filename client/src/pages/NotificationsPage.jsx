import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Badge, EmptyState, PageLoader } from '../components/ui';
import { formatDateTime } from '../utils/format';

const typeEmoji = {
  general: '📢',
  academic: '📚',
  exam: '📝',
  fee: '💰',
  event: '🎉',
  holiday: '🏖️',
  emergency: '🚨',
};

const typeColor = {
  general: 'gray',
  academic: 'blue',
  exam: 'violet',
  fee: 'amber',
  event: 'green',
  holiday: 'amber',
  emergency: 'red',
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/notifications')
      .then((d) => {
        if (!cancelled) setNotifs(d.notifications || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    if (!notifs) return;
    try {
      await Promise.all(notifs.filter((n) => !n.isRead).map((n) => api.put(`/api/notifications/${n._id}/read`)));
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* ignore */
    }
  };

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <EmptyState icon="⚠️" title="Could not load notifications" message={error.message} />
        </div>
      </div>
    );
  }

  if (!notifs) return <PageLoader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{notifs.filter((n) => !n.isRead).length} unread</p>
        </div>
        {notifs.some((n) => !n.isRead) && (
          <button type="button" className="btn" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <EmptyState icon="🔕" title="No notifications" message="You're all caught up." />
          </div>
        </div>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: '1fr' }}>
          {notifs.map((n) => (
            <div
              className="card"
              key={n._id}
              style={n.isRead ? undefined : { borderColor: 'var(--primary)', borderWidth: 1.5 }}
            >
              <div className="card-body">
                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 17 }}>{typeEmoji[n.type] || '📢'}</div>
                  <div className="flex gap-sm">
                    {!n.isRead && <Badge color="blue">New</Badge>}
                    <Badge color={typeColor[n.type] || 'gray'}>{n.type}</Badge>
                  </div>
                </div>
                <h3 style={{ marginTop: 10 }}>{n.title}</h3>
                <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{n.message}</p>
                <div className="flex" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                  <span className="text-muted" style={{ fontSize: 12 }}>{formatDateTime(n.createdAt)}</span>
                  {!n.isRead && (
                    <button type="button" className="btn btn-sm" onClick={() => markRead(n._id)}>
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}