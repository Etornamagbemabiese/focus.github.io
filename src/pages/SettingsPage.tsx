import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  GraduationCap, 
  Building2, 
  Calendar,
  Save,
  Home,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useHomePagePreference, HomePageOption } from '@/hooks/useHomePagePreference';
import { useSubscription } from '@/hooks/useSubscription';
import { StorageCard } from '@/components/settings/StorageCard';
import { SubscriptionCard } from '@/components/settings/SubscriptionCard';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';

export default function SettingsPage() {
  const { user, profile, signOut, updateProfile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { focusModeEnabled, toggleFocusMode } = useFocusMode();
  const { homePage, setHomePage, homePageOptions } = useHomePagePreference();
  const { storageInfo } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSchoolName(profile.school_name || '');
      setMajor(profile.major || '');
      setGraduationYear(profile.graduation_year?.toString() || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await updateProfile({
      display_name: displayName || null,
      school_name: schoolName || null,
      major: major || null,
      graduation_year: graduationYear ? parseInt(graduationYear) : null
    });
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

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

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>
            Your public profile info visible to classmates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">School / University</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="school"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g., Stanford University"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="major">Major / Field of Study</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradYear">Graduation Year</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="gradYear"
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="2026"
                  className="pl-10"
                  min="2020"
                  max="2035"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSaveProfile} 
            disabled={isSaving}
            className="w-full"
            variant="glow"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

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

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Account</CardTitle>
          <CardDescription>
            Manage your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full border-destructive text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
