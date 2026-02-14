import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import DashboardPage from "@/pages/DashboardPage";
import CalendarPage from "@/pages/CalendarPage";
import ClassesPage from "@/pages/ClassesPage";
import TodoPage from "@/pages/TodoPage";
import StudyModePage from "@/pages/StudyModePage";
import StudyGroupsPage from "@/pages/StudyGroupsPage";
import RecapPage from "@/pages/RecapPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";
import { homePageOptions, HomePageOption } from "@/hooks/useHomePagePreference";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem('forward-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.classList.add(theme);
    if (theme === 'dark') {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return null;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  // Not logged in → landing page
  if (!user) return <LandingPage />;
  
  // Logged in → respect home page preference
  const stored = localStorage.getItem('forward-home-page') as HomePageOption | null;
  const homePage = stored && homePageOptions.some(opt => opt.value === stored) 
    ? stored 
    : '/calendar';
  
  if (homePage === '/' || homePage === '/calendar') {
    return <CalendarPage />;
  }
  
  return <Navigate to={homePage} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInitializer />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/classes/:classId" element={<ClassesPage />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/study" element={<StudyModePage />} />
            <Route path="/study-groups" element={<StudyGroupsPage />} />
            <Route path="/recap" element={<RecapPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
