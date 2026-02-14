import React from 'react';
import { Settings2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WidgetConfig, WidgetType } from '@/types/dashboard';

interface WidgetCustomizerProps {
  widgets: WidgetConfig[];
  onToggle: (widgetId: WidgetType) => void;
  onReset: () => void;
}

export function WidgetCustomizer({ widgets, onToggle, onReset }: WidgetCustomizerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Choose which widgets to show on your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <Label
                  htmlFor={`widget-${widget.id}`}
                  className="font-medium cursor-pointer"
                >
                  {widget.name}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {widget.description}
                </p>
              </div>
              <Switch
                id={`widget-${widget.id}`}
                checked={widget.enabled}
                onCheckedChange={() => onToggle(widget.id)}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
