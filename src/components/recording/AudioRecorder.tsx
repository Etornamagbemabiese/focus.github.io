import React from 'react';
import { Mic, Square, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAudioRecording } from '@/hooks/useAudioRecording';

interface AudioRecorderProps {
  eventId?: string;
  classId?: string;
  onRecordingComplete?: (noteId: string, transcription: string) => void;
  onTodosExtracted?: (todos: any[]) => void;
  variant?: 'button' | 'inline';
  className?: string;
}

export function AudioRecorder({
  eventId,
  classId,
  onRecordingComplete,
  onTodosExtracted,
  variant = 'button',
  className,
}: AudioRecorderProps) {
  const {
    isRecording,
    isProcessing,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecording({
    onTranscriptionComplete: (transcription, noteId) => {
      onRecordingComplete?.(noteId, transcription);
    },
    onTodosExtracted,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopRecording = async () => {
    await stopRecording(eventId, classId);
  };

  if (isProcessing) {
    return (
      <Button disabled className={cn("flex-1", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (isRecording) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button 
          variant="recording" 
          onClick={handleStopRecording}
          className="flex-1"
        >
          <div className="recording-indicator mr-2" />
          <span className="font-mono">{formatDuration(recordingDuration)}</span>
          <Square className="h-4 w-4 ml-2 fill-current" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={cancelRecording}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="glow" 
      onClick={startRecording}
      className={cn("flex-1", className)}
    >
      <Mic className="h-4 w-4" />
      Record Note
    </Button>
  );
}
