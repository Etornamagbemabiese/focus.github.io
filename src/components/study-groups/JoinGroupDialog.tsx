import React, { useState } from 'react';
import { Link2, Search, Loader2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudyGroup } from '@/hooks/useStudyGroups';

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinByCode: (code: string) => Promise<unknown>;
  onFindBySchool: (school: string) => Promise<StudyGroup[]>;
}

export function JoinGroupDialog({
  open,
  onOpenChange,
  onJoinByCode,
  onFindBySchool,
}: JoinGroupDialogProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [joining, setJoining] = useState(false);
  const [searching, setSearching] = useState(false);
  const [foundGroups, setFoundGroups] = useState<StudyGroup[]>([]);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoining(true);
    try {
      const result = await onJoinByCode(inviteCode.trim());
      if (result) {
        setInviteCode('');
        onOpenChange(false);
      }
    } finally {
      setJoining(false);
    }
  };

  const handleSearch = async () => {
    if (!schoolName.trim()) return;

    setSearching(true);
    try {
      const groups = await onFindBySchool(schoolName.trim());
      setFoundGroups(groups);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Join Study Group
          </DialogTitle>
          <DialogDescription>
            Join with an invite code or find groups at your school
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="code" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code" className="gap-2">
              <Link2 className="h-4 w-4" />
              Invite Code
            </TabsTrigger>
            <TabsTrigger value="school" className="gap-2">
              <Search className="h-4 w-4" />
              Find by School
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="mt-4">
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input
                  id="invite-code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter 8-character code"
                  className="font-mono text-lg tracking-wider"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Ask your group member for the invite code
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={joining || inviteCode.length < 1}
              >
                {joining ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Join Group
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="school" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Search by school name..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {foundGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Search for groups at your school
                </p>
              ) : (
                foundGroups.map((group) => (
                  <Card key={group.id} variant="interactive">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {group.school_name} • {group.member_count || 1} member(s)
                      </CardDescription>
                    </CardHeader>
                    {group.description && (
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {group.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
