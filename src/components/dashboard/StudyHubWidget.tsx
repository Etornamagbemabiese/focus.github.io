import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight, Trophy, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock leaderboard data
const leaderboardData = [
  { id: '1', name: 'You', initials: 'ME', attendance: 12, rank: 1 },
  { id: '2', name: 'Alex M.', initials: 'AM', attendance: 10, rank: 2 },
  { id: '3', name: 'Jordan K.', initials: 'JK', attendance: 8, rank: 3 },
  { id: '4', name: 'Sam R.', initials: 'SR', attendance: 7, rank: 4 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <span className="text-lg">🥇</span>;
    case 2:
      return <span className="text-lg">🥈</span>;
    case 3:
      return <span className="text-lg">🥉</span>;
    default:
      return <span className="text-xs text-muted-foreground font-medium">#{rank}</span>;
  }
};

export function StudyHubWidget() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            Study Hub
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/study-groups">
              Open
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/study-groups"
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-colors"
          >
            <Users className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">Groups</span>
          </Link>
          <Link
            to="/study"
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">Study Mode</span>
          </Link>
        </div>

        {/* Attendance Leaderboard */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Medal className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium text-foreground">Attendance Leaderboard</h4>
          </div>
          <div className="space-y-1.5">
            {leaderboardData.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  user.name === 'You' 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-secondary/30 hover:bg-secondary/50'
                }`}
              >
                <div className="w-6 flex justify-center">
                  {getRankIcon(user.rank)}
                </div>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-muted">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <span className={`flex-1 text-xs ${user.name === 'You' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {user.name}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  {user.attendance} classes
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
