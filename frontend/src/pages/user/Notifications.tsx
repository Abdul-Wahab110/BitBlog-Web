import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getUserNotifications();
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await ApiService.markNotificationRead(id);
      fetchNotifications();
    } catch (err: any) {
      console.error('Failed to mark read:', err);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={22} color="var(--color-secondary)" /> Activity Notifications
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>System alerts, comment replies, and account updates</p>
      </header>

      {loading ? (
        <LoadingState message="Fetching activity notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet."
          description="You do not have any unread or past notifications."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {notifications.map(n => (
            <article
              key={n.notification_id}
              style={{
                padding: '1.25rem',
                backgroundColor: n.is_read ? 'var(--color-card)' : 'var(--color-surface-alt)',
                borderLeft: n.is_read ? '1px solid var(--color-border)' : '4px solid var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{n.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>{n.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{new Date(n.created_at).toLocaleString()}</span>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.notification_id)}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <Check size={14} color="var(--color-success)" /> Mark Read
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
