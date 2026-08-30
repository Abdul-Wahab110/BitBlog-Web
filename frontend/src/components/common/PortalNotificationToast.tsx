import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ArrowRight, FileText, CheckCircle2, Shield, Sparkles, MessageSquare, Mail } from 'lucide-react';
import { ApiService } from '../../services/api';

const SEEN_NOTIFS_STORAGE_KEY = 'bitblog_seen_toast_notification_ids';

const getSeenNotificationIds = (): Set<number> => {
  try {
    const raw = localStorage.getItem(SEEN_NOTIFS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set<number>(arr);
      }
    }
  } catch (e) {
    console.warn('Failed to parse seen notification ids from storage');
  }
  return new Set<number>();
};

const saveSeenNotificationIds = (ids: Set<number>) => {
  try {
    // Keep last 200 IDs to avoid unbounded growth
    const arr = Array.from(ids).slice(-200);
    localStorage.setItem(SEEN_NOTIFS_STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn('Failed to save seen notification ids to storage');
  }
};

export const PortalNotificationToast: React.FC = () => {
  const [currentNotif, setCurrentNotif] = useState<any | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const checkForNewNotifications = async () => {
    try {
      const res = await ApiService.getUserNotifications();
      if (res && res.data) {
        const unread = res.data.filter((n: any) => !n.is_read);
        if (unread.length === 0) return;

        const seenSet = getSeenNotificationIds();

        // Find genuinely new unread notifications that have NEVER been toasted yet
        const brandNew = unread.filter((n: any) => !seenSet.has(Number(n.notification_id)));

        if (brandNew.length > 0) {
          const latest = brandNew[0];

          // Mark all brand new notifications as seen in localStorage immediately
          // so they NEVER toast repeatedly on page refresh or navigation
          for (const item of brandNew) {
            seenSet.add(Number(item.notification_id));
          }
          saveSeenNotificationIds(seenSet);

          // Display single popup toast for this new arrival
          setCurrentNotif(latest);
          setVisible(true);

          // Auto-hide popup smoothly after 9 seconds if ignored
          if (autoDismissTimerRef.current) {
            clearTimeout(autoDismissTimerRef.current);
          }
          autoDismissTimerRef.current = setTimeout(() => {
            setVisible(false);
          }, 9000);
        }
      }
    } catch (err) {
      // Quiet fail in background
    }
  };

  useEffect(() => {
    // 1. Initial check after a subtle 800ms page load delay
    const initTimer = setTimeout(() => {
      checkForNewNotifications();
    }, 800);

    // 2. Continuous real-time background poll every 20 seconds
    const pollInterval = setInterval(() => {
      checkForNewNotifications();
    }, 20000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(pollInterval);
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, []);

  const handleDismiss = async (id?: number) => {
    setVisible(false);
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }
    if (id) {
      try {
        await ApiService.markNotificationRead(id);
      } catch (e) {}
    }
  };

  const handleActionClick = async (notif: any) => {
    setVisible(false);
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }
    try {
      await ApiService.markNotificationRead(notif.notification_id);
    } catch (e) {}

    if (notif.link_url) {
      navigate(notif.link_url);
    }
  };

  if (!visible || !currentNotif) {
    return null;
  }

  // Get icon and color badge according to notification category
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ARTICLE_SUBMITTED':
        return { label: 'Story Awaiting Review', icon: FileText, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' };
      case 'ARTICLE_APPROVED':
        return { label: 'Story Approved', icon: CheckCircle2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
      case 'COMMENT_MODERATED':
      case 'COMMENT_REPLY':
        return { label: 'Discussion Alert', icon: MessageSquare, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' };
      default:
        return { label: 'New Portal Alert', icon: Bell, color: 'var(--color-secondary)', bg: 'rgba(99, 102, 241, 0.15)' };
    }
  };

  const badge = getTypeBadge(currentNotif.type);
  const BadgeIcon = badge.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        zIndex: 99999,
        maxWidth: '430px',
        width: 'calc(100% - 3.5rem)',
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${badge.color}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 14px 40px rgba(0, 0, 0, 0.4), 0 0 24px rgba(99, 102, 241, 0.15)',
        padding: '1.25rem',
        animation: 'portalSlideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        boxSizing: 'border-box',
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: badge.bg,
            color: badge.color,
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
          }}
        >
          <BadgeIcon size={13} />
          <span>{badge.label}</span>
        </div>

        <button
          onClick={() => handleDismiss(currentNotif.notification_id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            padding: '0.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'color 0.15s ease',
          }}
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <h4
        style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          margin: '0 0 0.35rem 0',
          color: 'var(--color-text)',
          lineHeight: 1.35,
        }}
      >
        {currentNotif.title}
      </h4>
      <p
        style={{
          fontSize: '0.84rem',
          color: 'var(--color-text-secondary)',
          margin: '0 0 0.95rem 0',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {currentNotif.message}
      </p>

      {/* Footer Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => handleDismiss(currentNotif.notification_id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.3rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          Dismiss
        </button>

        <button
          onClick={() => handleActionClick(currentNotif)}
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
            transition: 'all 0.15s ease',
          }}
        >
          <span>Review Now</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <style>{`
        @keyframes portalSlideInUp {
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

