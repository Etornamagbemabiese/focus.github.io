import React from 'react';
import { Users, Copy, ChevronRight, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { StudyGroup } from '@/hooks/useStudyGroups';

interface GroupCardProps {
  group: StudyGroup;
  isOwner: boolean;
  onClick: () => void;
}

export function GroupCard({ group, isOwner, onClick }: GroupCardProps) {
  const copyInviteCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(group.invite_code);
    toast.success('Invite code copied!');
  };

  return (
    <Card variant="interactive" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {group.name}
                {isOwner && (
                  <Crown className="h-3.5 w-3.5 text-warning" />
                )}
              </CardTitle>
              {group.school_name && (
                <CardDescription className="text-xs">
                  {group.school_name}
                </CardDescription>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {group.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {group.member_count || 1} member{(group.member_count || 1) > 1 ? 's' : ''}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1"
            onClick={copyInviteCode}
          >
            <Copy className="h-3 w-3" />
            {group.invite_code}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
