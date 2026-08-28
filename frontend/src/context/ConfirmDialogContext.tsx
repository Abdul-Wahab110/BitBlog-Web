import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Info, X } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
  });
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions | string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (typeof opts === 'string') {
        setOptions({
          title: 'Confirm Action',
          message: opts,
          confirmText: 'Yes, Proceed',
          cancelText: 'Cancel',
          type: 'danger',
        });
      } else {
        setOptions({
          title: opts.title || (opts.type === 'danger' ? 'Delete Confirmation' : 'Confirm Action'),
          message: opts.message,
          confirmText: opts.confirmText || (opts.type === 'danger' ? 'Yes, Delete' : 'Confirm'),
          cancelText: opts.cancelText || 'Cancel',
          type: opts.type || 'danger',
        });
      }
      setResolver(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  const isDanger = options.type === 'danger' || !options.type;
  const isWarning = options.type === 'warning';
  const isSuccess = options.type === 'success';

  const accentColor = isDanger
    ? 'var(--color-danger, #EF4444)'
    : isWarning
    ? 'var(--color-warning, #F59E0B)'
    : isSuccess
    ? 'var(--color-success, #10B981)'
    : 'var(--color-secondary, #6366F1)';

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            padding: '1.25rem',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--color-card, #181926)',
              borderRadius: 'var(--radius-lg, 16px)',
              border: `1px solid rgba(255, 255, 255, 0.12)`,
              boxShadow: `0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 0 24px ${isDanger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
              padding: '1.75rem',
              color: 'var(--color-text, #F3F4F6)',
              animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: `${accentColor}18`,
                  border: `1px solid ${accentColor}35`,
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isDanger ? (
                  <Trash2 size={22} />
                ) : isWarning ? (
                  <AlertTriangle size={22} />
                ) : isSuccess ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <Info size={22} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    margin: '0 0 0.35rem 0',
                    color: 'var(--color-text, #FFFFFF)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {options.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.55,
                    color: 'var(--color-text-secondary, #9CA3AF)',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {options.message}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted, #6B7280)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '0.6rem 1.15rem',
                  backgroundColor: 'var(--color-surface, rgba(255, 255, 255, 0.06))',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.1))',
                  color: 'var(--color-text, #E5E7EB)',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {options.cancelText}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                autoFocus
                style={{
                  padding: '0.6rem 1.25rem',
                  backgroundColor: accentColor,
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${accentColor}40`,
                  transition: 'all 0.15s ease',
                }}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context.confirm;
};
