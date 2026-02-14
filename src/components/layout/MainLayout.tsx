import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { GlobalSearchDialog } from '@/components/search/GlobalSearchDialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useIsMobile } from '@/hooks/use-mobile';

export function MainLayout() {
  const { sidebarOpen, mobileSidebarOpen, setMobileSidebarOpen } = useAppStore();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden off-screen on mobile unless mobileSidebarOpen */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-transform duration-300",
          isMobile
            ? mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            : "translate-x-0"
        )}
      >
        <Sidebar onNavigate={() => isMobile && setMobileSidebarOpen(false)} />
      </div>

      <GlobalSearchDialog />

      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          isMobile
            ? "ml-0"
            : sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
