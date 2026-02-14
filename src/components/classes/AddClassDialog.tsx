import React, { useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useClasses } from '@/hooks/useClasses';
import { ClassFormData, CLASS_COLORS, DAY_NAMES } from '@/types/classes';

interface AddClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<ClassFormData>;
}

export function AddClassDialog({ open, onOpenChange, initialData }: AddClassDialogProps) {
  const { createClass, isCreating } = useClasses();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState<ClassFormData>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    professor_name: initialData?.professor_name || '',
    professor_email: initialData?.professor_email || '',
    color: initialData?.color || CLASS_COLORS[0],
    meeting_days: initialData?.meeting_days || [],
    start_time: initialData?.start_time || '09:00',
    end_time: initialData?.end_time || '10:30',
    location: initialData?.location || '',
    timezone: initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    semester_start: initialData?.semester_start || format(new Date(), 'yyyy-MM-dd'),
    semester_end: initialData?.semester_end || format(new Date(new Date().setMonth(new Date().getMonth() + 4)), 'yyyy-MM-dd'),
    section_number: initialData?.section_number || '',
    office_hours_day: initialData?.office_hours_day || '',
    office_hours_time: initialData?.office_hours_time || '',
    office_hours_location: initialData?.office_hours_location || '',
    class_website: initialData?.class_website || '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof ClassFormData>(field: K, value: ClassFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      meeting_days: prev.meeting_days.includes(day)
        ? prev.meeting_days.filter(d => d !== day)
        : [...prev.meeting_days, day].sort(),
    }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Course name is required';
    if (!formData.professor_name.trim()) newErrors.professor_name = 'Professor name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (formData.meeting_days.length === 0) newErrors.meeting_days = 'Select at least one meeting day';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    createClass(formData, {
      onSuccess: () => {
        onOpenChange(false);
        setStep(1);
        setFormData({
          name: '',
          code: '',
          professor_name: '',
          professor_email: '',
          color: CLASS_COLORS[0],
          meeting_days: [],
          start_time: '09:00',
          end_time: '10:30',
          location: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          semester_start: format(new Date(), 'yyyy-MM-dd'),
          semester_end: format(new Date(new Date().setMonth(new Date().getMonth() + 4)), 'yyyy-MM-dd'),
          section_number: '',
          office_hours_day: '',
          office_hours_time: '',
          office_hours_location: '',
          class_website: '',
          notes: '',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
        </DialogHeader>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={cn(
                  'h-2 rounded-full transition-colors',
                  s <= step ? 'bg-primary' : 'bg-secondary'
                )}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {s === 1 && 'Basic Info'}
                {s === 2 && 'Schedule'}
                {s === 3 && 'Optional'}
              </p>
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Introduction to Biology"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                placeholder="e.g., BIO 101"
                value={formData.code}
                onChange={(e) => updateField('code', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professor">Professor Name *</Label>
              <Input
                id="professor"
                placeholder="e.g., Dr. Sarah Chen"
                value={formData.professor_name}
                onChange={(e) => updateField('professor_name', e.target.value)}
              />
              {errors.professor_name && <p className="text-sm text-destructive">{errors.professor_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Professor Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="professor@university.edu"
                value={formData.professor_email}
                onChange={(e) => updateField('professor_email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Class Color</Label>
              <div className="flex gap-2 flex-wrap">
                {CLASS_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'h-8 w-8 rounded-full transition-all',
                      formData.color === color && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => updateField('color', color)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Meeting Days *</Label>
              <div className="flex gap-2 flex-wrap">
                {DAY_NAMES.map((day, index) => (
                  <Badge
                    key={day}
                    variant={formData.meeting_days.includes(index) ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => toggleDay(index)}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
              {errors.meeting_days && <p className="text-sm text-destructive">{errors.meeting_days}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => updateField('start_time', e.target.value)}
                />
                {errors.start_time && <p className="text-sm text-destructive">{errors.start_time}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => updateField('end_time', e.target.value)}
                />
                {errors.end_time && <p className="text-sm text-destructive">{errors.end_time}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Engineering Hall 201 or 'Online'"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester_start">Semester Start</Label>
                <Input
                  id="semester_start"
                  type="date"
                  value={formData.semester_start}
                  onChange={(e) => updateField('semester_start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester_end">Semester End</Label>
                <Input
                  id="semester_end"
                  type="date"
                  value={formData.semester_end}
                  onChange={(e) => updateField('semester_end', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Optional Info */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section Number</Label>
              <Input
                id="section"
                placeholder="e.g., 001"
                value={formData.section_number}
                onChange={(e) => updateField('section_number', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Office Hours</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Day"
                  value={formData.office_hours_day}
                  onChange={(e) => updateField('office_hours_day', e.target.value)}
                />
                <Input
                  placeholder="Time"
                  value={formData.office_hours_time}
                  onChange={(e) => updateField('office_hours_time', e.target.value)}
                />
                <Input
                  placeholder="Location"
                  value={formData.office_hours_location}
                  onChange={(e) => updateField('office_hours_location', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Class Website / LMS Link</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://canvas.university.edu/course/..."
                value={formData.class_website}
                onChange={(e) => updateField('class_website', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this class..."
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Class'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
