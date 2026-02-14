import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Sparkles, CheckSquare, Users, ArrowRight, Play, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Calendar,
    title: 'Smart Calendar Hub',
    description: 'Sync Google, Outlook & Apple calendars in one unified view.',
  },
  {
    icon: BookOpen,
    title: 'Class-Linked Notes',
    description: 'Every note auto-links to its class session. Never lose context.',
  },
  {
    icon: Sparkles,
    title: 'AI Weekly Recaps',
    description: 'Get intelligent summaries of your week to prep for exams.',
  },
  {
    icon: CheckSquare,
    title: 'Smart To-Dos',
    description: 'Tasks extracted from notes and syllabi, organized by priority.',
  },
  {
    icon: Users,
    title: 'Study Groups',
    description: 'Collaborate with classmates and share notes effortlessly.',
  },
  {
    icon: GraduationCap,
    title: 'Study Mode',
    description: 'AI-generated flashcards and study guides from your notes.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">F</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Focus</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button variant="glow" size="sm" onClick={() => navigate('/auth?signup=true')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Built for students who move fast
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground animate-slide-up">
            Your academic life,{' '}
            <span className="text-gradient">organized.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Calendar, notes, tasks, and study tools — all linked together. 
            Stop juggling apps and start focusing on what matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="glow" 
              size="xl" 
              onClick={() => navigate('/calendar')}
              className="group"
            >
              <Play className="h-5 w-5" />
              Try the Demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              onClick={() => navigate('/auth?signup=true')}
            >
              Create Free Account
            </Button>
          </div>

          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
            No credit card required · Explore everything before signing up
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to <span className="text-gradient">ace your semester</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              One app that connects your calendar, notes, and study tools — so nothing falls through the cracks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 animate-slide-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Ready to get <span className="text-gradient">ahead</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join students who are organizing smarter, not harder.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="glow" size="xl" onClick={() => navigate('/auth?signup=true')}>
              Sign Up Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/calendar')}>
              <Play className="h-4 w-4" />
              Explore Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">F</span>
            </div>
            <span>Focus</span>
          </div>
          <span>© {new Date().getFullYear()} Focus. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
