import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { WidgetCustomizer } from '@/components/dashboard/WidgetCustomizer';
import { SortableWidget } from '@/components/dashboard/SortableWidget';
import { UpcomingEventsWidget } from '@/components/dashboard/UpcomingEventsWidget';
import { TodoWidget } from '@/components/dashboard/TodoWidget';
import { ClassesWidget } from '@/components/dashboard/ClassesWidget';
import { StudyHubWidget } from '@/components/dashboard/StudyHubWidget';
import { WeeklyRecapWidget } from '@/components/dashboard/WeeklyRecapWidget';
import { WidgetType } from '@/types/dashboard';

const widgetComponents: Record<WidgetType, React.ComponentType> = {
  'upcoming-events': UpcomingEventsWidget,
  'todo': TodoWidget,
  'classes': ClassesWidget,
  'study-hub': StudyHubWidget,
  'weekly-recap': WeeklyRecapWidget,
};

export function DashboardPage() {
  const { widgets, enabledWidgets, toggleWidget, reorderWidgets, resetToDefaults } = useDashboardPreferences();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderWidgets(active.id as string, over.id as string);
    }
  };

  const renderWidget = (widgetId: WidgetType) => {
    const WidgetComponent = widgetComponents[widgetId];
    return WidgetComponent ? <WidgetComponent /> : null;
  };

  // Separate widgets by size for mixed layout
  const largeWidgets = enabledWidgets.filter((w) => w.size === 'large');
  const mediumWidgets = enabledWidgets.filter((w) => w.size === 'medium');
  const smallWidgets = enabledWidgets.filter((w) => w.size === 'small');

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <MobileMenuButton />
            <div className="p-2 rounded-xl gradient-primary">
              <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Your personalized overview of everything that matters
          </p>
        </div>
        <WidgetCustomizer
          widgets={widgets}
          onToggle={toggleWidget}
          onReset={resetToDefaults}
        />
      </div>

      {/* Widgets Grid */}
      {enabledWidgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LayoutDashboard className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No widgets enabled
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Click "Customize" to add widgets to your dashboard
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            {/* Large Widgets - Full width */}
            {largeWidgets.length > 0 && (
              <SortableContext
                items={largeWidgets.map((w) => w.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 gap-6">
                  {largeWidgets.map((widget) => (
                    <SortableWidget key={widget.id} id={widget.id} className="min-h-[320px]">
                      {renderWidget(widget.id)}
                    </SortableWidget>
                  ))}
                </div>
              </SortableContext>
            )}

            {/* Medium Widgets - 2 columns */}
            {mediumWidgets.length > 0 && (
              <SortableContext
                items={mediumWidgets.map((w) => w.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mediumWidgets.map((widget) => (
                    <SortableWidget key={widget.id} id={widget.id} className="min-h-[360px]">
                      {renderWidget(widget.id)}
                    </SortableWidget>
                  ))}
                </div>
              </SortableContext>
            )}

            {/* Small Widgets - 3 columns */}
            {smallWidgets.length > 0 && (
              <SortableContext
                items={smallWidgets.map((w) => w.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {smallWidgets.map((widget) => (
                    <SortableWidget key={widget.id} id={widget.id} className="min-h-[280px]">
                      {renderWidget(widget.id)}
                    </SortableWidget>
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </DndContext>
      )}
    </div>
  );
}

export default DashboardPage;
