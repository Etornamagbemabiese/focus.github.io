import React from 'react';
import { Crown, Check, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TIER_FEATURES = {
  free: [
    '100 MB storage',
    'Unlimited notes',
    'Basic study guides',
    'Join study groups',
  ],
  plus: [
    '5 GB storage',
    'Priority AI processing',
    'Advanced study guides',
    'Create study groups',
    'Audio transcription',
  ],
  premium: [
    '50 GB storage',
    'Unlimited AI features',
    'Export all data',
    'Priority support',
    'Early access to features',
    'Custom themes',
  ],
};

interface SubscriptionCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionCard({ isOpen, onClose }: SubscriptionCardProps) {
  const { storageInfo, getTierInfo } = useSubscription();

  if (!isOpen) return null;

  const currentTier = storageInfo?.tier || 'free';

  const handleUpgrade = (tier: SubscriptionTier) => {
    toast.info('Payment integration coming soon! You\'ll be able to upgrade here.', {
      description: `Selected: ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan`,
      duration: 4000,
    });
  };

  const plans: { tier: SubscriptionTier; icon: React.ReactNode; color: string }[] = [
    { tier: 'free', icon: <Zap className="h-5 w-5" />, color: 'text-muted-foreground' },
    { tier: 'plus', icon: <Sparkles className="h-5 w-5" />, color: 'text-blue-500' },
    { tier: 'premium', icon: <Crown className="h-5 w-5" />, color: 'text-amber-500' },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Upgrade Your Plan
            </CardTitle>
            <CardDescription>
              Get more storage and premium features
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(({ tier, icon, color }) => {
            const info = getTierInfo(tier);
            const isCurrent = tier === currentTier;
            const isUpgrade = tier !== 'free' && !isCurrent;

            return (
              <div
                key={tier}
                className={cn(
                  "relative p-4 rounded-xl border transition-all",
                  isCurrent 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30 hover:bg-secondary/50"
                )}
              >
                {isCurrent && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    Current
                  </Badge>
                )}

                <div className="text-center mb-4">
                  <div className={cn("inline-flex p-2 rounded-full bg-secondary mb-2", color)}>
                    {icon}
                  </div>
                  <h3 className="font-semibold text-lg">{info.name}</h3>
                  {info.price ? (
                    <div className="mt-1">
                      <span className="text-2xl font-bold">${info.price.monthly}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground mt-1">Free</div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {TIER_FEATURES[tier].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {isUpgrade && (
                  <Button 
                    className="w-full" 
                    variant={tier === 'premium' ? 'glow' : 'default'}
                    onClick={() => handleUpgrade(tier)}
                  >
                    Upgrade to {info.name}
                  </Button>
                )}

                {isCurrent && tier !== 'premium' && (
                  <div className="text-center text-sm text-muted-foreground">
                    Your current plan
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Payment processing will be available soon. Prices may vary based on region.
        </p>
      </CardContent>
    </Card>
  );
}
