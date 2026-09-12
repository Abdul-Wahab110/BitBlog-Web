import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="cms-theme-toggle-btn"
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border)',
        padding: '0.35rem 0.65rem',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text)',
        cursor: 'pointer',
      }}
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      <span className="cms-theme-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
};

