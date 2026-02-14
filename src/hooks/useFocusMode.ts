import { useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

export function useFocusMode() {
  const { focusModeEnabled, setFocusMode } = useAppStore();

  const toggleFocusMode = useCallback(() => {
    const newState = !focusModeEnabled;
    setFocusMode(newState);
    
    if (newState) {
      toast.success('Focus Mode enabled', {
        description: 'In-app notifications are now muted. For full iOS Do Not Disturb, enable it in iOS Settings → Focus.',
        duration: 4000,
      });
    } else {
      toast('Focus Mode disabled', {
        description: 'Notifications are back on.',
        duration: 2000,
      });
    }
  }, [focusModeEnabled, setFocusMode]);

  // Suppress toasts when focus mode is active
  useEffect(() => {
    if (focusModeEnabled) {
      // Override toast behavior - this is a simple approach
      // In production, you'd want to intercept toast calls
      document.body.classList.add('focus-mode-active');
    } else {
      document.body.classList.remove('focus-mode-active');
    }
  }, [focusModeEnabled]);

  return {
    focusModeEnabled,
    toggleFocusMode,
    setFocusMode,
  };
}
