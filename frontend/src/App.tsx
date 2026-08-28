import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';
import { AuthModal } from './components/auth/AuthModal';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <ConfirmDialogProvider>
            <BrowserRouter>
              <AppRoutes />
              <AuthModal />
            </BrowserRouter>
          </ConfirmDialogProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;


