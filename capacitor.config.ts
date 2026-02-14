import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b13f2278b3bb4c1498f5f6db3e6a1e19',
  appName: 'Forward',
  webDir: 'dist',
  server: {
    url: 'https://b13f2278-b3bb-4c14-98f5-f6db3e6a1e19.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
