import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SyllabusExtraction } from '@/types/classes';
import { useToast } from '@/hooks/use-toast';

export function useSyllabusParser() {
  const [isParsing, setIsParsing] = useState(false);
  const [extractedData, setExtractedData] = useState<SyllabusExtraction | null>(null);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // For now, we'll use a simple approach that reads the file
    // In production, you'd want to use a proper PDF parsing library
    // or process it server-side
    
    // Read as text (works for text-based PDFs)
    const text = await file.text();
    
    // If we got mostly gibberish (binary data), it's likely a scanned PDF
    // In that case, we'd need OCR which should be done server-side
    if (text.includes('%PDF-')) {
      // This is a binary PDF, extract what text we can
      // Match text between stream and endstream markers
      const streamMatches = text.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g);
      if (streamMatches) {
        const extractedParts: string[] = [];
        for (const match of streamMatches) {
          // Try to extract readable text
          const readable = match.replace(/[^\x20-\x7E\r\n]/g, ' ').trim();
          if (readable.length > 50) {
            extractedParts.push(readable);
          }
        }
        if (extractedParts.length > 0) {
          return extractedParts.join('\n\n');
        }
      }
      
      // Fallback: return what we can clean up
      return text
        .replace(/[^\x20-\x7E\r\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 50000); // Limit size
    }
    
    return text;
  };

  const parseSyllabus = async (file: File): Promise<SyllabusExtraction | null> => {
    setIsParsing(true);
    setExtractedData(null);

    try {
      // Extract text from PDF
      const syllabusText = await extractTextFromPDF(file);
      
      if (!syllabusText || syllabusText.length < 100) {
        toast({
          title: 'Could not read PDF',
          description: 'The PDF appears to be scanned or empty. Please try a text-based PDF or enter information manually.',
          variant: 'destructive',
        });
        return null;
      }

      // Call the edge function to parse with AI
      const { data, error } = await supabase.functions.invoke('parse-syllabus', {
        body: { 
          syllabusText: syllabusText.slice(0, 30000), // Limit to ~30k chars
          fileName: file.name 
        },
      });

      if (error) throw error;

      if (!data?.success || !data?.data) {
        throw new Error(data?.error || 'Failed to extract syllabus information');
      }

      const extracted = data.data as SyllabusExtraction;
      setExtractedData(extracted);
      
      toast({
        title: 'Syllabus parsed',
        description: 'Review the extracted information below.',
      });

      return extracted;
    } catch (error) {
      console.error('Error parsing syllabus:', error);
      toast({
        title: 'Failed to parse syllabus',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsParsing(false);
    }
  };

  const uploadSyllabus = async (file: File, classId: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const filePath = `${user.id}/${classId}/${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('syllabi')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('syllabi')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading syllabus:', error);
      return null;
    }
  };

  const clearExtraction = () => {
    setExtractedData(null);
  };

  return {
    isParsing,
    extractedData,
    parseSyllabus,
    uploadSyllabus,
    clearExtraction,
  };
}
