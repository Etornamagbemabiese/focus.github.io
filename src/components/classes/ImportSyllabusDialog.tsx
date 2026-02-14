import React, { useState, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { Upload, FileText, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSyllabusParser } from '@/hooks/useSyllabusParser';
import { useClasses } from '@/hooks/useClasses';
import { supabase } from '@/integrations/supabase/client';
import { SyllabusExtraction, ExtractedDeadline, ClassFormData, CLASS_COLORS, DAY_NAMES } from '@/types/classes';
import { useToast } from '@/hooks/use-toast';

interface ImportSyllabusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'upload' | 'review' | 'confirm';

export function ImportSyllabusDialog({ open, onOpenChange }: ImportSyllabusDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isParsing, extractedData, parseSyllabus, clearExtraction } = useSyllabusParser();
  const { createClass, isCreating } = useClasses();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [editedData, setEditedData] = useState<SyllabusExtraction | null>(null);
  const [selectedDeadlines, setSelectedDeadlines] = useState<Set<number>>(new Set());
  const [color, setColor] = useState(CLASS_COLORS[0]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile.type.includes('pdf')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    const result = await parseSyllabus(selectedFile);
    
    if (result) {
      setEditedData(result);
      setSelectedDeadlines(new Set(result.deadlines?.map((_, i) => i) || []));
      setStep('review');
    }
  }, [parseSyllabus, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateEditedField = <K extends keyof SyllabusExtraction>(
    field: K,
    value: SyllabusExtraction[K]
  ) => {
    setEditedData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const toggleDay = (day: number) => {
    if (!editedData) return;
    const newDays = editedData.meetingDays.includes(day)
      ? editedData.meetingDays.filter(d => d !== day)
      : [...editedData.meetingDays, day].sort();
    updateEditedField('meetingDays', newDays);
  };

  const toggleDeadline = (index: number) => {
    setSelectedDeadlines(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!editedData) return;

    // Validate required fields
    if (!editedData.courseName?.trim()) {
      toast({ title: 'Course name is required', variant: 'destructive' });
      return;
    }
    if (!editedData.professorName?.trim()) {
      toast({ title: 'Professor name is required', variant: 'destructive' });
      return;
    }
    if (!editedData.location?.trim()) {
      toast({ title: 'Location is required', variant: 'destructive' });
      return;
    }
    if (editedData.meetingDays.length === 0) {
      toast({ title: 'At least one meeting day is required', variant: 'destructive' });
      return;
    }
    if (!editedData.startTime || !editedData.endTime) {
      toast({ title: 'Meeting times are required', variant: 'destructive' });
      return;
    }

    const formData: ClassFormData = {
      name: editedData.courseName,
      code: editedData.courseCode || '',
      professor_name: editedData.professorName,
      professor_email: editedData.professorEmail || '',
      color,
      meeting_days: editedData.meetingDays,
      start_time: editedData.startTime,
      end_time: editedData.endTime,
      location: editedData.location,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      semester_start: editedData.semesterStart || format(new Date(), 'yyyy-MM-dd'),
      semester_end: editedData.semesterEnd || format(new Date(new Date().setMonth(new Date().getMonth() + 4)), 'yyyy-MM-dd'),
      section_number: '',
      office_hours_day: editedData.officeHours?.day || '',
      office_hours_time: editedData.officeHours?.time || '',
      office_hours_location: editedData.officeHours?.location || '',
      class_website: '',
      notes: '',
    };

    createClass(formData, {
      onSuccess: async (newClass) => {
        // Add selected deadlines
        const { data: { user } } = await supabase.auth.getUser();
        if (user && editedData.deadlines?.length > 0) {
          const deadlinesToInsert = editedData.deadlines
            .filter((_, i) => selectedDeadlines.has(i))
            .map(d => ({
              class_id: newClass.id,
              user_id: user.id,
              title: d.title,
              description: d.description,
              deadline_type: d.type,
              due_date: d.dueDate,
              weight: d.weight,
              status: 'upcoming',
              source: 'syllabus',
            }));

          if (deadlinesToInsert.length > 0) {
            await supabase.from('deadlines').insert(deadlinesToInsert);
          }
        }

        toast({
          title: 'Class created from syllabus',
          description: `${formData.name} has been added with ${selectedDeadlines.size} deadlines.`,
        });

        handleClose();
      },
    });
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setEditedData(null);
    setSelectedDeadlines(new Set());
    setColor(CLASS_COLORS[0]);
    clearExtraction();
    onOpenChange(false);
  };

  const ConfidenceBadge = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
    const variants = {
      high: 'bg-green-500/10 text-green-500',
      medium: 'bg-yellow-500/10 text-yellow-500',
      low: 'bg-red-500/10 text-red-500',
    };
    return (
      <Badge variant="outline" className={cn('text-xs', variants[level])}>
        {level === 'low' && <AlertCircle className="h-3 w-3 mr-1" />}
        {level} confidence
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Import Syllabus'}
            {step === 'review' && 'Review Extracted Information'}
          </DialogTitle>
        </DialogHeader>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isParsing ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {isParsing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing syllabus with AI...
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">Drop your syllabus PDF here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </>
              )}
            </div>

            {file && !isParsing && (
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">{file.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && editedData && (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Course Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Course Information</h3>
                  <ConfidenceBadge level={editedData.confidence?.courseName || 'medium'} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course Name *</Label>
                    <Input
                      value={editedData.courseName || ''}
                      onChange={(e) => updateEditedField('courseName', e.target.value)}
                      className={!editedData.courseName ? 'border-destructive' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Course Code</Label>
                    <Input
                      value={editedData.courseCode || ''}
                      onChange={(e) => updateEditedField('courseCode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Professor *</Label>
                    <Input
                      value={editedData.professorName || ''}
                      onChange={(e) => updateEditedField('professorName', e.target.value)}
                      className={!editedData.professorName ? 'border-destructive' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={editedData.professorEmail || ''}
                      onChange={(e) => updateEditedField('professorEmail', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Class Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {CLASS_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={cn(
                          'h-7 w-7 rounded-full transition-all',
                          color === c && 'ring-2 ring-offset-2 ring-primary'
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Schedule</h3>
                  <ConfidenceBadge level={editedData.confidence?.schedule || 'medium'} />
                </div>

                <div className="space-y-2">
                  <Label>Meeting Days *</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DAY_NAMES.map((day, index) => (
                      <Badge
                        key={day}
                        variant={editedData.meetingDays.includes(index) ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1.5"
                        onClick={() => toggleDay(index)}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Input
                      type="time"
                      value={editedData.startTime || ''}
                      onChange={(e) => updateEditedField('startTime', e.target.value)}
                      className={!editedData.startTime ? 'border-destructive' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time *</Label>
                    <Input
                      type="time"
                      value={editedData.endTime || ''}
                      onChange={(e) => updateEditedField('endTime', e.target.value)}
                      className={!editedData.endTime ? 'border-destructive' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input
                      value={editedData.location || ''}
                      onChange={(e) => updateEditedField('location', e.target.value)}
                      className={!editedData.location ? 'border-destructive' : ''}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semester Start</Label>
                    <Input
                      type="date"
                      value={editedData.semesterStart || ''}
                      onChange={(e) => updateEditedField('semesterStart', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Semester End</Label>
                    <Input
                      type="date"
                      value={editedData.semesterEnd || ''}
                      onChange={(e) => updateEditedField('semesterEnd', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Deadlines */}
              {editedData.deadlines && editedData.deadlines.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Extracted Deadlines ({selectedDeadlines.size} selected)
                    </h3>
                    <ConfidenceBadge level={editedData.confidence?.deadlines || 'medium'} />
                  </div>

                  <div className="space-y-2">
                    {editedData.deadlines.map((deadline, index) => (
                      <Card
                        key={index}
                        className={cn(
                          'cursor-pointer transition-colors',
                          selectedDeadlines.has(index) ? 'border-primary' : 'opacity-60'
                        )}
                        onClick={() => toggleDeadline(index)}
                      >
                        <CardContent className="p-3 flex items-start gap-3">
                          <Checkbox
                            checked={selectedDeadlines.has(index)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{deadline.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {deadline.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Due: {format(new Date(deadline.dueDate), 'MMM d, yyyy')}
                              {deadline.weight && ` • ${deadline.weight}%`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          {step === 'review' ? (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleConfirm} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Class'
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose} className="ml-auto">
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
