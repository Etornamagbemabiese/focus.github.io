import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  GraduationCap, 
  Calendar,
  Home,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useHomePagePreference, HomePageOption } from '@/hooks/useHomePagePreference';
import { useSubscription } from '@/hooks/useSubscription';
import { StorageCard } from '@/components/settings/StorageCard';
import { SubscriptionCard } from '@/components/settings/SubscriptionCard';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { focusModeEnabled, toggleFocusMode } = useFocusMode();
  const { homePage, setHomePage, homePageOptions } = useHomePagePreference();
  const { storageInfo } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>
        </div>
        {storageInfo && (
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3" />
            {storageInfo.tier.charAt(0).toUpperCase() + storageInfo.tier.slice(1)}
          </Badge>
        )}
      </div>

      {/* Storage & Subscription Section */}
      <StorageCard onUpgrade={() => setShowUpgrade(true)} />
      <SubscriptionCard isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how Focus looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
              </p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Focus Mode</Label>
              <p className="text-sm text-muted-foreground">
                Suppress in-app notifications while studying
              </p>
            </div>
            <Switch
              checked={focusModeEnabled}
              onCheckedChange={toggleFocusMode}
              aria-label="Toggle focus mode"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <Label>Default Home Page</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose what you see first when you open the app
            </p>
            <RadioGroup
              value={homePage}
              onValueChange={(value) => setHomePage(value as HomePageOption)}
              className="grid grid-cols-2 gap-2"
            >
              {homePageOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`home-${option.value}`} />
                  <Label htmlFor={`home-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
