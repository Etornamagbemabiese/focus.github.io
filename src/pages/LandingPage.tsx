import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const handleTryDemo = () => {
    navigate('/calendar');
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 glass">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16 sm:h-[4.5rem]">
          <Link to="/landing" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-lg font-bold text-primary-foreground">F</span>
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight">Focus</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6">
        {/* Ambient gradient orbs */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] sm:w-[700px] h-[400px] sm:h-[500px] rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-[60px] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in shadow-sm">
            <Sparkles className="h-4 w-4" />
            Built for students who move fast
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground animate-slide-up leading-[1.1]">
            Your academic life,{' '}
            <span className="text-gradient">organized.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Calendar, notes, tasks, and study tools — all linked together. 
            Stop juggling apps and start focusing on what matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up pt-2" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="glow" 
              size="xl" 
              onClick={handleTryDemo}
              className="group btn-glow rounded-xl px-8 h-14 text-base font-semibold"
            >
              <Play className="h-5 w-5" />
              Try the Demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
            No credit card required · Explore everything before signing up
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 sm:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
              Everything you need to <span className="text-gradient">ace your semester</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              One app that connects your calendar, notes, and study tools — so nothing falls through the cracks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-2xl border border-border bg-card/80 backdrop-blur-sm hover:border-primary/25 hover:bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors group-hover:scale-105">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Ready to get <span className="text-gradient">ahead</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Join students who are organizing smarter, not harder.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleTryDemo}
              className="rounded-xl border-2 px-8 h-12 font-medium hover:bg-primary/5 hover:border-primary/30"
            >
              <Play className="h-4 w-4" />
              Explore Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">F</span>
            </div>
            <span className="font-medium text-foreground/80">Focus</span>
          </div>
          <span>© {new Date().getFullYear()} Focus. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
