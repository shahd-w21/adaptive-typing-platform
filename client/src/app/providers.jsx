import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext.jsx';
import { PreferencesProvider } from '../context/PreferencesContext.jsx';
import { queryClient } from './queryClient.js';

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PreferencesProvider>{children}</PreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
