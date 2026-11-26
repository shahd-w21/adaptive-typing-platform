import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext.jsx';
import { PreferencesProvider } from '../context/PreferencesContext.jsx';
import { RewardsProvider } from '../context/RewardsContext.jsx';
import { queryClient } from './queryClient.js';

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RewardsProvider>
          <PreferencesProvider>{children}</PreferencesProvider>
        </RewardsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
