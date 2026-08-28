import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, X, ArrowRight, Award, FileText, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { ApiService } from '../../services/api';

export const PortalNotificationToast: React.FC = () => {
  const [unreadList, setUnreadList] = useState<any[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnread();
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await ApiService.getUserNotifications();
      if (res && res.data) {
        const unread = res.data.filter((n: any) => !n.is_read);
        setUnreadList(unread);
        if (unread.length > 0 && !dismissed) {
          // Open toast after a slight 600ms entrance delay for sleek visual feel
          const timer = setTimeout(() => setVisible(true), 600);
          return () => clearTimeout(timer);
        }
      }
    } catch (err) {
      console.error('Failed to fetch portal notifications:', err);
    }
  };

  const handleDismiss = async (id?: number) => {
    setVisible(false);
    setDismissed(true);
    if (id) {
      try {
        await ApiService.markNotificationRead(id);
      } catch (e) {}
    }
  };

  const handleActionClick = async (notif: any) => {
    setVisible(false);
    setDismissed(true);
    try {
      await ApiService.markNotificationRead(notif.notification_id);
    } catch (e) {}

    if (notif.link_url) {
      navigate(notif.link_url);
    }
  };

  if (!visible || unreadList.length === 0) {
    return null;
  }

  const latest = unreadList[0];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        zIndex: 9999,
        maxWidth: '420px',
        width: 'calc(100% - 3.5rem)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-secondary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35), 0 0 20px var(--color-secondary-glow)',
        padding: '1.25rem',
        animation: 'slideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-secondary-glow)', color: 'var(--color-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
          <Bell size={13} />
          <span>New Portal Alert {unreadList.length > 1 ? `(${unreadList.length})` : ''}</span>
        </div>

        <button
          onClick={() => handleDismiss(latest.notification_id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            padding: '0.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.3rem 0', color: 'var(--color-text)' }}>
        {latest.title}
      </h4>
      <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
        {latest.message}
      </p>

      {/* Footer Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={() => handleDismiss(latest.notification_id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
          }}
        >
          Dismiss
        </button>

        <button
          onClick={() => handleActionClick(latest)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--color-secondary)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px var(--color-secondary-glow)',
          }}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
