import React, { useState } from 'react';
import { Download, Copy, Check, Calendar as CalendarIcon, Plus, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useExternalCalendars, ExternalCalendar } from '@/hooks/useExternalCalendars';
import { cn } from '@/lib/utils';

interface CalendarSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROVIDER_COLORS = [
  '#4285F4', // Google blue
  '#0078D4', // Outlook blue
  '#FF6B6B', // Red
  '#51CF66', // Green
  '#FF922B', // Orange
  '#845EF7', // Purple
  '#339AF0', // Light blue
  '#20C997', // Teal
];

const PROVIDER_OPTIONS = [
  { value: 'google', label: 'Google Calendar' },
  { value: 'outlook', label: 'Outlook / Office 365' },
  { value: 'apple', label: 'Apple Calendar' },
  { value: 'other', label: 'Other (ICS URL)' },
];

export function CalendarSyncDialog({ open, onOpenChange }: CalendarSyncDialogProps) {
  const { calendars, syncing, addCalendar, removeCalendar, toggleCalendar, syncCalendar } = useExternalCalendars();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Add calendar form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newProvider, setNewProvider] = useState('google');
  const [newColor, setNewColor] = useState(PROVIDER_COLORS[0]);

  const getIcsUrl = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to sync your calendar');
      return null;
    }
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    return `https://${projectId}.supabase.co/functions/v1/generate-ics-feed?token=${session.access_token}`;
  };

  const handleDownloadICS = async () => {
    setDownloading(true);
    try {
      const url = await getIcsUrl();
      if (!url) return;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'forward-calendar.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success('Calendar file downloaded!');
    } catch {
      toast.error('Failed to download calendar file');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = await getIcsUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Calendar link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleAddCalendar = async () => {
    if (!newName.trim() || !newUrl.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setAdding(true);
    const result = await addCalendar(newName.trim(), newUrl.trim(), newProvider, newColor);
    setAdding(false);
    if (result) {
      setShowAddForm(false);
      setNewName('');
      setNewUrl('');
      setNewProvider('google');
      setNewColor(PROVIDER_COLORS[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendar Hub
          </DialogTitle>
          <DialogDescription>
            Import external calendars and export your Focus calendar.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="import" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import Calendars</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4 mt-4">
            {/* Connected calendars */}
            {calendars.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Connected Calendars</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => syncCalendar()}
                    disabled={syncing}
                  >
                    <RefreshCw className={cn("h-3 w-3 mr-1", syncing && "animate-spin")} />
                    {syncing ? 'Syncing...' : 'Sync All'}
                  </Button>
                </div>
                {calendars.map((cal) => (
                  <div
                    key={cal.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cal.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{cal.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {PROVIDER_OPTIONS.find((p) => p.value === cal.provider)?.label || cal.provider}
                        {cal.last_synced_at && ` · Last synced ${new Date(cal.last_synced_at).toLocaleDateString()}`}
                      </div>
                    </div>
                    <Switch
                      checked={cal.enabled}
                      onCheckedChange={(enabled) => toggleCalendar(cal.id, enabled)}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeCalendar(cal.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add calendar form */}
            {showAddForm ? (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <h4 className="text-sm font-medium">Add Calendar</h4>
                <div className="space-y-2">
                  <Label htmlFor="cal-name" className="text-xs">Calendar Name</Label>
                  <Input
                    id="cal-name"
                    placeholder="My Google Calendar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cal-provider" className="text-xs">Provider</Label>
                  <Select value={newProvider} onValueChange={(v) => {
                    setNewProvider(v);
                    if (v === 'google') setNewColor('#4285F4');
                    else if (v === 'outlook') setNewColor('#0078D4');
                    else if (v === 'apple') setNewColor('#FF6B6B');
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDER_OPTIONS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cal-url" className="text-xs">ICS Feed URL</Label>
                  <Input
                    id="cal-url"
                    placeholder="https://calendar.google.com/calendar/ical/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {newProvider === 'google' && 'Google Calendar → Settings → Calendar settings → Secret address in iCal format'}
                    {newProvider === 'outlook' && 'Outlook → Calendar → Settings → Shared calendars → Publish a calendar → ICS link'}
                    {newProvider === 'apple' && 'iCloud → Calendar → Share Calendar → Public Calendar → Copy Link'}
                    {newProvider === 'other' && 'Paste any valid ICS/iCal feed URL'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2">
                    {PROVIDER_COLORS.map((c) => (
                      <button
                        key={c}
                        className={cn(
                          "h-6 w-6 rounded-full border-2 transition-transform",
                          newColor === c ? "border-foreground scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setNewColor(c)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleAddCalendar} disabled={adding} size="sm">
                    {adding ? 'Adding...' : 'Add & Sync'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add External Calendar
              </Button>
            )}

            {calendars.length === 0 && !showAddForm && (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No external calendars connected yet.</p>
                <p className="text-xs mt-1">Add your Google Calendar or Outlook to see all events in one place.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <h4 className="text-sm font-medium">Subscribe via URL</h4>
              <p className="text-xs text-muted-foreground">
                Copy this link and add it as a subscription in Google Calendar or Outlook.
              </p>
              <Button onClick={handleCopyLink} className="w-full" variant="outline">
                {copied ? <><Check className="h-4 w-4 mr-2" />Copied!</> : <><Copy className="h-4 w-4 mr-2" />Copy Calendar URL</>}
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <h4 className="text-sm font-medium">Download .ics File</h4>
              <p className="text-xs text-muted-foreground">
                Download a snapshot to import into any calendar app.
              </p>
              <Button onClick={handleDownloadICS} className="w-full" disabled={downloading}>
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Downloading...' : 'Download Calendar File'}
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">How to subscribe:</h4>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div><span className="font-semibold text-foreground">Google:</span> Settings → Add calendar → From URL</div>
                <div><span className="font-semibold text-foreground">Outlook:</span> Add calendar → Subscribe from web</div>
                <div><span className="font-semibold text-foreground">Apple:</span> File → New Calendar Subscription</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
