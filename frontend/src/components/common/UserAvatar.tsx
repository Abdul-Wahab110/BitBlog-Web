import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  showOnline?: boolean;
  border?: boolean;
  alt?: string;
}

const GRADIENTS = [
  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
];

const getGradientForName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  size = 36,
  className = '',
  style = {},
  showOnline = false,
  border = true,
  alt,
}) => {
  const [imgError, setImgError] = useState(false);

  // If source changes, reset error state
  React.useEffect(() => {
    setImgError(false);
  }, [src]);

  const initials = getInitials(name);
  const background = getGradientForName(name || 'User');
  const fontSize = Math.max(11, Math.round(size * 0.4));

  const hasValidImage = !!src && src.trim().length > 0 && !imgError;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: border ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
        ...style,
      }}
    >
      {hasValidImage ? (
        <img
          src={src!}
          alt={alt || `${name}'s avatar`}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            border: border ? '2px solid var(--color-border)' : 'none',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background,
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: `${fontSize}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: '0.5px',
            border: border ? '2px solid rgba(255,255,255,0.2)' : 'none',
            userSelect: 'none',
          }}
          aria-label={alt || `${name}'s initials avatar`}
        >
          {initials}
        </div>
      )}

      {showOnline && (
        <span
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: `${Math.max(8, Math.round(size * 0.28))}px`,
            height: `${Math.max(8, Math.round(size * 0.28))}px`,
            borderRadius: '50%',
            backgroundColor: '#10B981',
            border: '2px solid var(--color-surface)',
            boxShadow: '0 0 4px rgba(16, 185, 129, 0.6)',
          }}
          title="Online"
        />
      )}
    </div>
  );
};
