import React from 'react';
import { HardDrive, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

interface StorageCardProps {
  onUpgrade: () => void;
}

export function StorageCard({ onUpgrade }: StorageCardProps) {
  const { storageInfo, loading } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded-full" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!storageInfo) return null;

  const isNearLimit = storageInfo.usedPercentage >= 80;
  const isAtLimit = storageInfo.usedPercentage >= 95;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          Storage
        </CardTitle>
        <CardDescription>
          Manage your file storage across notes, recordings, and syllabi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {storageInfo.usedFormatted} of {storageInfo.limitFormatted} used
            </span>
            <span className={cn(
              "font-medium",
              isAtLimit && "text-destructive",
              isNearLimit && !isAtLimit && "text-warning"
            )}>
              {storageInfo.usedPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={storageInfo.usedPercentage} 
            className={cn(
              "h-3",
              isAtLimit && "[&>div]:bg-destructive",
              isNearLimit && !isAtLimit && "[&>div]:bg-warning"
            )}
          />
        </div>

        {isNearLimit && (
          <div className={cn(
            "text-sm p-3 rounded-lg",
            isAtLimit ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
          )}>
            {isAtLimit 
              ? "You've almost reached your storage limit. Upgrade to continue uploading."
              : "You're running low on storage. Consider upgrading for more space."}
          </div>
        )}

        {storageInfo.tier === 'free' && (
          <Button 
            onClick={onUpgrade}
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/5"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Need more storage? Upgrade your plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
