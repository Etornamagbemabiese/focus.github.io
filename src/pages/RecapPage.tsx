import React from 'react';
import { format, subDays, startOfWeek } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Calendar,
  TrendingUp,
  Brain,
  FileText,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';
import { mockWeeklySummaries } from '@/data/mockData';

export function RecapPage() {
  const { classes } = useAppStore();
  const summaries = mockWeeklySummaries;

  const getClassById = (classId: string) => classes.find(c => c.id === classId);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const lastWeekStart = subDays(weekStart, 7);

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <MobileMenuButton />
            <div className="p-2 rounded-xl gradient-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Weekly Recap</h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered summaries of what you learned each week
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate New
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">Notes this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground">Lectures attended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Brain className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-xs text-muted-foreground">Topics covered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Selector */}
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="default" className="px-3 py-1">
          {format(lastWeekStart, 'MMM d')} - {format(subDays(weekStart, 1), 'MMM d, yyyy')}
        </Badge>
        <span className="text-sm text-muted-foreground">Last week</span>
      </div>

      {/* Summaries by Class */}
      <div className="space-y-6">
        {summaries.map((summary) => {
          const classData = getClassById(summary.classId);
          
          return (
            <Card key={summary.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${classData?.color}20` }}
                    >
                      <BookOpen className="h-5 w-5" style={{ color: classData?.color }} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {classData?.name}
                        <Badge 
                          variant="class"
                          style={{
                            backgroundColor: `${classData?.color}20`,
                            borderColor: `${classData?.color}50`,
                            color: classData?.color
                          }}
                        >
                          {classData?.code}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Generated {format(summary.generatedAt, 'MMM d, h:mm a')}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/classes/${summary.classId}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Key Topics */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {summary.keyTopics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>

                {/* Summary Content */}
                <div className="prose prose-sm prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                    {summary.summary}
                  </div>
                </div>

                {/* Source Notes */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Generated from {summary.sourceNoteIds.length} note{summary.sourceNoteIds.length !== 1 && 's'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No summaries message */}
      {summaries.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No recaps yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Take some notes during your lectures and we'll generate your first weekly recap
            </p>
            <Button variant="outline">
              Go to Calendar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RecapPage;
