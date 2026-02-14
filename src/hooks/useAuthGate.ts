import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook that gates actions behind authentication.
 * In demo mode (not logged in), it shows the auth prompt dialog.
 * When logged in, it executes the action normally.
 */
export function useAuthGate() {
  const { user, loading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | undefined>();

  const requireAuth = useCallback(
    (action: () => void, message?: string) => {
      if (user) {
        action();
      } else {
        setAuthMessage(message);
        setShowAuthDialog(true);
      }
    },
    [user]
  );

  const isAuthenticated = !!user;

  return {
    isAuthenticated,
    loading,
    requireAuth,
    showAuthDialog,
    setShowAuthDialog,
    authMessage,
  };
}
