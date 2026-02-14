import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  FileText,
  Trophy,
  Copy,
  Mail,
  Loader2,
  LogOut,
  Crown,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  StudyGroup,
  GroupMember,
  SharedNote,
  AttendanceLeaderboard,
} from '@/hooks/useStudyGroups';

interface GroupDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: StudyGroup | null;
  currentUserId: string | null;
  onGetMembers: (groupId: string) => Promise<GroupMember[]>;
  onGetSharedNotes: (groupId: string) => Promise<SharedNote[]>;
  onGetLeaderboard: (groupId: string) => Promise<AttendanceLeaderboard[]>;
  onInviteByEmail: (groupId: string, email: string) => Promise<boolean>;
  onLeaveGroup: (groupId: string) => Promise<boolean>;
}

export function GroupDetailSheet({
  open,
  onOpenChange,
  group,
  currentUserId,
  onGetMembers,
  onGetSharedNotes,
  onGetLeaderboard,
  onInviteByEmail,
  onLeaveGroup,
}: GroupDetailSheetProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const [leaderboard, setLeaderboard] = useState<AttendanceLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isOwner = group?.owner_id === currentUserId;

  useEffect(() => {
    if (open && group) {
      loadData();
    }
  }, [open, group]);

  const loadData = async () => {
    if (!group) return;
    setLoading(true);
    try {
      const [membersData, notesData, leaderboardData] = await Promise.all([
        onGetMembers(group.id),
        onGetSharedNotes(group.id),
        onGetLeaderboard(group.id),
      ]);
      setMembers(membersData);
      setSharedNotes(notesData);
      setLeaderboard(leaderboardData);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.invite_code);
      toast.success('Invite code copied!');
    }
  };

  const handleInvite = async () => {
    if (!group || !inviteEmail.trim()) return;
    
    setInviting(true);
    try {
      const success = await onInviteByEmail(group.id, inviteEmail);
      if (success) {
        setInviteEmail('');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleLeave = async () => {
    if (!group || isOwner) return;
    
    setLeaving(true);
    try {
      const success = await onLeaveGroup(group.id);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setLeaving(false);
    }
  };

  if (!group) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{group.name}</SheetTitle>
              {group.school_name && (
                <p className="text-sm text-muted-foreground">{group.school_name}</p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Invite Section */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Invite Friends</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 justify-between"
                  onClick={copyInviteCode}
                >
                  <span className="font-mono tracking-wider">{group.invite_code}</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
                <Button size="icon" onClick={handleInvite} disabled={inviting}>
                  {inviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="members" className="flex-1">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="members" className="gap-1.5">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1.5">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-1.5">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-4">
              <ScrollArea className="h-[350px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Owner */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <Crown className="h-4 w-4 text-amber-500" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">Owner</p>
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Group Creator
                        </Badge>
                      </div>
                    </div>
                    
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {(member.profile?.display_name || member.profile?.email || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {member.profile?.display_name || member.profile?.email || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <ScrollArea className="h-[350px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : sharedNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No shared notes yet</p>
                    <p className="text-xs mt-1">Share notes from your classes</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sharedNotes.map((sn) => (
                      <Card key={sn.id}>
                        <CardContent className="p-3">
                          <p className="font-medium text-sm">
                            {sn.note?.title || 'Untitled Note'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Shared by {sn.sharer?.display_name || sn.sharer?.email || 'Unknown'} •{' '}
                            {new Date(sn.shared_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-4">
              <ScrollArea className="h-[350px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No attendance data yet</p>
                    <p className="text-xs mt-1">Mark your class attendance to compete!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          index === 0
                            ? 'bg-primary/10 border border-primary/20'
                            : index === 1
                            ? 'bg-muted border border-muted-foreground/20'
                            : index === 2
                            ? 'bg-secondary border border-secondary-foreground/20'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="w-6 text-center font-bold text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback>
                            {(entry.display_name || entry.email)[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {entry.display_name || entry.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {entry.attendance_count} classes
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Leave Group */}
          {!isOwner && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleLeave}
              disabled={leaving}
            >
              {leaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Leave Group
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
