import React, { useState } from 'react';
import { 
  X, 
  Save, 
  FileText, 
  Pencil,
  Loader2,
  Sparkles
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RichTextEditor } from './RichTextEditor';
import { DrawingCanvas } from './DrawingCanvas';

interface NoteEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId?: string;
  classId?: string;
  onNoteSaved?: (noteId: string) => void;
}

export function NoteEditorSheet({
  open,
  onOpenChange,
  eventId,
  classId,
  onNoteSaved,
}: NoteEditorSheetProps) {
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [drawingDataUrl, setDrawingDataUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const { toast } = useToast();

  const handleSave = async () => {
    if (!textContent && !drawingDataUrl) {
      toast({
        title: "Nothing to save",
        description: "Add some text or drawing before saving",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Combine text and drawing info
      let combinedContent = textContent;
      
      // If there's a drawing, we could upload it to storage
      // For now, we'll store the data URL in the content (for small drawings)
      // In production, you'd want to upload to storage
      let drawingUrl: string | null = null;
      
      if (drawingDataUrl) {
        // Convert data URL to blob and upload
        const response = await fetch(drawingDataUrl);
        const blob = await response.blob();
        
        const fileName = `${user.id}/${Date.now()}-drawing.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio-notes') // Reusing the same bucket for simplicity
          .upload(fileName, blob, {
            contentType: 'image/png',
          });

        if (uploadError) {
          console.error('Failed to upload drawing:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('audio-notes')
            .getPublicUrl(fileName);
          drawingUrl = publicUrl;
        }
      }

      // Create the note
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          event_id: eventId || null,
          class_id: classId || null,
          type: 'text',
          title: title || 'Untitled Note',
          content: combinedContent,
          // Store drawing URL in a custom field or in content
          transcription: drawingUrl ? `[Drawing attached: ${drawingUrl}]` : null,
        })
        .select()
        .single();

      if (noteError) {
        throw new Error(`Failed to save note: ${noteError.message}`);
      }

      // Process with AI to extract to-dos if there's text content
      if (textContent) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Strip HTML tags for AI processing
          const plainText = textContent.replace(/<[^>]*>/g, '');
          
          const { data: processResult, error: processError } = await supabase.functions.invoke(
            'process-audio-note',
            {
              body: {
                noteId: noteData.id,
                transcription: plainText,
                classId: classId || null,
                eventId: eventId || null,
              },
            }
          );

          if (processError) {
            console.error('Failed to process note:', processError);
          } else if (processResult?.todosExtracted > 0) {
            toast({
              title: `${processResult.todosExtracted} to-do${processResult.todosExtracted > 1 ? 's' : ''} extracted!`,
              description: "AI found action items in your note",
            });
          }
        }
      }

      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });

      onNoteSaved?.(noteData.id);
      
      // Reset form
      setTitle('');
      setTextContent('');
      setDrawingDataUrl(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save note:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (textContent || drawingDataUrl) {
      // Could add a confirmation dialog here
    }
    setTitle('');
    setTextContent('');
    setDrawingDataUrl(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] flex flex-col"
      >
        <SheetHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="glow"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Note
            </Button>
          </div>
        </SheetHeader>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="w-fit">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="draw" className="gap-2">
              <Pencil className="h-4 w-4" />
              Draw
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="text" 
            className="flex-1 mt-4 min-h-0 overflow-auto"
          >
            <RichTextEditor
              content={textContent}
              onChange={setTextContent}
              placeholder="Start typing your notes... Use headings, lists, and formatting to organize your thoughts."
              className="h-full"
            />
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>AI will automatically extract to-dos from your notes</span>
            </div>
          </TabsContent>

          <TabsContent 
            value="draw" 
            className="flex-1 mt-4 min-h-0 overflow-auto"
          >
            <DrawingCanvas
              width={1200}
              height={600}
              onDrawingChange={setDrawingDataUrl}
              initialDrawing={drawingDataUrl}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Use the pen tool to draw, scribble notes, or create diagrams. Your drawing will be saved with your note.
            </p>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
