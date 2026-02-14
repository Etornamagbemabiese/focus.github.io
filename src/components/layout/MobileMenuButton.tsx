import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppStore } from '@/store/useAppStore';

export function MobileMenuButton() {
  const isMobile = useIsMobile();
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);

  if (!isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 md:hidden"
      onClick={() => setMobileSidebarOpen(true)}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}