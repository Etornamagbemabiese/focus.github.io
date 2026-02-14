import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, BookOpen, Sparkles, CheckSquare, Users, ArrowRight, Play, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FounderCard } from '@/components/landing/FounderCard';

const founders = [
  {
    name: "Fredre'Oni (Oni) Terrado",
    image: `${import.meta.env.BASE_URL}oni.jpeg`,
    role: 'CEO',
    bullets: '• UNC Chapel Hill\n• Psychology, Info Science & Entrepreneurship\n• Morehead-Cain Scholar\n• Carolina Union Activities Board President\n• Frohlich Lab research\n• Shuford Ambassador',
    bio: "Growing up as a military child, Oni learned that home is built through connections and community. She's led revitalization projects, supported refugees in Thailand, and contributes to Alzheimer's research. Her work sits at the intersection of entrepreneurship and psychology—helping people find belonging and mental well-being.",
  },
  {
    name: 'Etornam Agbemabiese',
    image: `${import.meta.env.BASE_URL}etornam.jpeg`,
    role: 'COO',
    bullets: '• UNC Chapel Hill\n• Business Admin & Computer Science\n• MLT Scholar, VCIC Fellow\n• Incoming DaVita Redwoods Analyst\n• STAR Consultant',
    bio: 'Etornam loves dissecting complex problems and turning data into action. A founding team member of Zellit and VCIC Fellow, he\'s focused on consulting and venture capital—especially in emerging markets where investing demands strong judgment and contextual intelligence.',
  },
  {
    name: 'Grace Odondi',
    image: `${import.meta.env.BASE_URL}grace.jpeg`,
    role: 'CTO',
    bullets: '• UNC Chapel Hill\n• CS & Math\n• Full Stack SWE @ Fidelity\n• VP Black in Technology\n• UNC CS Teaching Assistant\n• ColorStack',
    bio: 'Grace is committed to making technical education more accessible. As VP of Black in Technology and a CS Teaching Assistant, she helps students build skills and confidence. She brings diverse perspectives to everything she does—from the classroom to the choir.',
  },
];
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 glass safe-top">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 md:h-[4.5rem]">
          <Link to="/landing" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity min-h-[44px] py-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <span className="text-base sm:text-lg font-bold text-primary-foreground">F</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">Focus</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 md:pt-36 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6">
        {/* Ambient gradient orbs - smaller on mobile */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] md:w-[700px] h-[250px] sm:h-[400px] md:h-[500px] rounded-full bg-primary/15 blur-[80px] sm:blur-[100px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-[60px] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 md:space-y-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium animate-fade-in shadow-sm">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Built for students who move fast
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground animate-slide-up leading-[1.15] px-1">
            Your academic life,{' '}
            <span className="text-gradient">organized.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up leading-relaxed px-4" style={{ animationDelay: '0.1s' }}>
            Calendar, notes, tasks, and study tools — all linked together. 
            Stop juggling apps and start focusing on what matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up pt-2" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="glow" 
              size="xl" 
              onClick={handleTryDemo}
              className="group btn-glow rounded-xl px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base font-semibold w-full sm:w-auto min-h-[48px] touch-manipulation"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              Try the Demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground animate-fade-in px-4" style={{ animationDelay: '0.3s' }}>
            No credit card required · Explore everything before signing up
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-5 tracking-tight px-2">
              Everything you need to <span className="text-gradient">ace your semester</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed px-4">
              One app that connects your calendar, notes, and study tools — so nothing falls through the cracks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-border bg-card/80 backdrop-blur-sm hover:border-primary/25 hover:bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 animate-slide-up active:scale-[0.99]"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary/15 transition-colors group-hover:scale-105">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-[15px] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-5 tracking-tight px-2">
              Meet the <span className="text-gradient">founders</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed px-4">
              Tap a card to flip and learn more about each team member.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-2xl sm:max-w-none mx-auto sm:mx-0">
            {founders.map((founder) => (
              <FounderCard
                key={founder.name}
                name={founder.name}
                image={founder.image}
                role={founder.role}
                bullets={founder.bullets}
                bio={founder.bio}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight px-2">
            Ready to get <span className="text-gradient">ahead</span>?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto px-4">
            Join students who are organizing smarter, not harder.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleTryDemo}
              className="rounded-xl border-2 px-6 sm:px-8 h-12 font-medium hover:bg-primary/5 hover:border-primary/30 w-full sm:w-auto min-h-[48px] touch-manipulation"
            >
              <Play className="h-4 w-4" />
              Explore Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-10 px-4 sm:px-6 bg-card/30 safe-bottom">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg gradient-primary flex items-center justify-center">
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
