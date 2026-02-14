import React from 'react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, subDays } from 'date-fns';
import { Sparkles, ChevronRight, FileText, TrendingUp, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockWeeklySummaries } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { Progress } from '@/components/ui/progress';

export function WeeklyRecapWidget() {
  const { classes } = useAppStore();
  const summaries = mockWeeklySummaries;
  
  const latestSummary = summaries[0];
  const classData = latestSummary
    ? classes.find((c) => c.id === latestSummary.classId)
    : null;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const lastWeekStart = subDays(weekStart, 7);

  // Mock weekly stats
  const weeklyStats = {
    notes: 12,
    lectures: 8,
    topics: 24,
    completionRate: 75,
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            Weekly Recap
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/recap">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <Badge variant="secondary" className="w-fit text-xs">
          {format(lastWeekStart, 'MMM d')} - {format(subDays(weekStart, 1), 'MMM d')}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 pt-0 space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Weekly Progress</span>
            <span className="font-medium text-foreground">{weeklyStats.completionRate}%</span>
          </div>
          <Progress value={weeklyStats.completionRate} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-secondary/50 text-center">
            <FileText className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-base font-bold text-foreground">{weeklyStats.notes}</p>
            <p className="text-[10px] text-muted-foreground">Notes</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-base font-bold text-foreground">{weeklyStats.lectures}</p>
            <p className="text-[10px] text-muted-foreground">Lectures</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50 text-center">
            <BookOpen className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-base font-bold text-foreground">{weeklyStats.topics}</p>
            <p className="text-[10px] text-muted-foreground">Topics</p>
          </div>
        </div>

        {/* Latest Summary Preview */}
        {latestSummary && classData && (
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: classData?.color }}
              />
              <span className="text-xs font-medium text-foreground truncate">
                {classData?.code || classData?.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {latestSummary.summary}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {latestSummary.keyTopics.slice(0, 2).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-[10px]">
                  {topic}
                </Badge>
              ))}
              {latestSummary.keyTopics.length > 2 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{latestSummary.keyTopics.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
