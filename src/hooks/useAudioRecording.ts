import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseAudioRecordingOptions {
  onTranscriptionComplete?: (transcription: string, noteId: string) => void;
  onTodosExtracted?: (todos: any[]) => void;
}

export function useAudioRecording(options: UseAudioRecordingOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcription, setTranscription] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      // Update duration every second
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async (
    eventId?: string,
    classId?: string
  ): Promise<{ noteId: string; transcription: string } | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;
      
      mediaRecorder.onstop = async () => {
        // Clean up timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(chunksRef.current, { 
            type: mediaRecorder.mimeType 
          });
          
          const duration = recordingDuration;
          
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Not authenticated');
          }

          // Upload audio to storage
          const fileName = `${user.id}/${Date.now()}.webm`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('audio-notes')
            .upload(fileName, audioBlob, {
              contentType: mediaRecorder.mimeType,
            });

          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('audio-notes')
            .getPublicUrl(fileName);

          // For now, we'll create a placeholder transcription
          // In a real app, you'd use a speech-to-text service
          const placeholderTranscription = `[Audio recording - ${duration} seconds]\n\nNote: Speech-to-text transcription will be added. For now, please describe the key points from your recording.`;

          // Create the note in the database
          const { data: noteData, error: noteError } = await supabase
            .from('notes')
            .insert({
              user_id: user.id,
              event_id: eventId || null,
              class_id: classId || null,
              type: 'audio',
              content: placeholderTranscription,
              audio_url: publicUrl,
              transcription: placeholderTranscription,
              duration_seconds: duration,
            })
            .select()
            .single();

          if (noteError) {
            throw new Error(`Failed to save note: ${noteError.message}`);
          }

          setTranscription(placeholderTranscription);
          
          // Process with AI to extract to-dos
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: processResult, error: processError } = await supabase.functions.invoke(
              'process-audio-note',
              {
                body: {
                  noteId: noteData.id,
                  transcription: placeholderTranscription,
                  classId: classId || null,
                  eventId: eventId || null,
                },
              }
            );

            if (processError) {
              console.error('Failed to process note:', processError);
            } else if (processResult?.todos && options.onTodosExtracted) {
              options.onTodosExtracted(processResult.todos);
            }
          }

          toast({
            title: "Note saved",
            description: `Recording saved (${duration}s). AI is analyzing for to-dos.`,
          });

          if (options.onTranscriptionComplete) {
            options.onTranscriptionComplete(placeholderTranscription, noteData.id);
          }

          resolve({ noteId: noteData.id, transcription: placeholderTranscription });
        } catch (error) {
          console.error('Failed to process recording:', error);
          toast({
            title: "Processing failed",
            description: error instanceof Error ? error.message : "Failed to process recording",
            variant: "destructive",
          });
          resolve(null);
        } finally {
          setIsProcessing(false);
          setRecordingDuration(0);
        }
      };

      mediaRecorder.stop();
    });
  }, [recordingDuration, toast, options]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    chunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  }, []);

  return {
    isRecording,
    isProcessing,
    recordingDuration,
    transcription,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
