import { useState, useEffect, useCallback } from 'react';
import { WidgetConfig, defaultWidgets, WidgetType } from '@/types/dashboard';

const STORAGE_KEY = 'forward-dashboard-widgets';

export function useDashboardPreferences() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as WidgetConfig[];
        // Merge with defaults to handle new widgets
        const merged = defaultWidgets.map((defaultWidget, index) => {
          const storedWidget = parsed.find((w) => w.id === defaultWidget.id);
          return storedWidget 
            ? { ...defaultWidget, enabled: storedWidget.enabled, order: storedWidget.order ?? index } 
            : { ...defaultWidget, order: index };
        });
        // Sort by order
        merged.sort((a, b) => a.order - b.order);
        setWidgets(merged);
      } catch {
        setWidgets(defaultWidgets);
      }
    }
  }, []);

  const toggleWidget = (widgetId: WidgetType) => {
    setWidgets((prev) => {
      const updated = prev.map((w) =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const reorderWidgets = useCallback((activeId: string, overId: string) => {
    setWidgets((prev) => {
      const oldIndex = prev.findIndex((w) => w.id === activeId);
      const newIndex = prev.findIndex((w) => w.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newWidgets = [...prev];
      const [removed] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, removed);
      
      // Update order values
      const updated = newWidgets.map((w, index) => ({ ...w, order: index }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetToDefaults = () => {
    setWidgets(defaultWidgets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWidgets));
  };

  const enabledWidgets = widgets.filter((w) => w.enabled);

  return {
    widgets,
    enabledWidgets,
    toggleWidget,
    reorderWidgets,
    resetToDefaults,
  };
}
