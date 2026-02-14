import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'free' | 'plus' | 'premium';

export interface StorageInfo {
  usedBytes: number;
  limitBytes: number;
  tier: SubscriptionTier;
  usedPercentage: number;
  usedFormatted: string;
  limitFormatted: string;
}

const TIER_LIMITS = {
  free: 100 * 1024 * 1024, // 100 MB
  plus: 5 * 1024 * 1024 * 1024, // 5 GB
  premium: 50 * 1024 * 1024 * 1024, // 50 GB
};

const TIER_PRICES = {
  plus: { monthly: 4.99, yearly: 49.99 },
  premium: { monthly: 9.99, yearly: 99.99 },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function useSubscription() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>({
    usedBytes: 0,
    limitBytes: TIER_LIMITS.free,
    tier: 'free',
    usedPercentage: 0,
    usedFormatted: '0 B',
    limitFormatted: formatBytes(TIER_LIMITS.free),
  });
  const [loading, setLoading] = useState(false);

  const fetchStorageInfo = useCallback(async () => {
    setStorageInfo({
      usedBytes: 0,
      limitBytes: TIER_LIMITS.free,
      tier: 'free',
      usedPercentage: 0,
      usedFormatted: '0 B',
      limitFormatted: formatBytes(TIER_LIMITS.free),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStorageInfo();
  }, [fetchStorageInfo]);

  const getTierInfo = (tier: SubscriptionTier) => {
    return {
      name: tier.charAt(0).toUpperCase() + tier.slice(1),
      limit: TIER_LIMITS[tier],
      limitFormatted: formatBytes(TIER_LIMITS[tier]),
      price: tier === 'free' ? null : TIER_PRICES[tier],
    };
  };

  return {
    storageInfo,
    loading,
    refetch: fetchStorageInfo,
    getTierInfo,
    tierLimits: TIER_LIMITS,
    tierPrices: TIER_PRICES,
  };
}
