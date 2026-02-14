import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface PracticeQuestion {
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  answer: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudyGuide {
  id: string;
  user_id: string;
  class_id: string | null;
  group_id: string | null;
  title: string;
  summary: string | null;
  key_concepts: KeyConcept[];
  practice_questions: PracticeQuestion[];
  flashcards: Flashcard[];
  source_note_ids: string[];
  generated_at: string;
  updated_at: string;
}

export function useStudyGuide() {
  const [generating, setGenerating] = useState(false);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(false);

  const generateStudyGuide = async (params: {
    classId?: string;
    groupId?: string;
    noteIds?: string[];
  }): Promise<StudyGuide | null> => {
    setGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to generate a study guide');
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-study-guide`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
          return null;
        }
        if (response.status === 402) {
          toast.error('AI credits exhausted. Please add credits to continue.');
          return null;
        }
        
        throw new Error(error.error || 'Failed to generate study guide');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Study guide generated!');
      return data as StudyGuide;
    } catch (error) {
      console.error('Error generating study guide:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate study guide');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const fetchStudyGuides = async (classId?: string) => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('study_guides')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Parse JSONB fields
      const parsedGuides = (data || []).map(guide => ({
        ...guide,
        key_concepts: (guide.key_concepts as unknown as KeyConcept[]) || [],
        practice_questions: (guide.practice_questions as unknown as PracticeQuestion[]) || [],
        flashcards: (guide.flashcards as unknown as Flashcard[]) || [],
      }));

      setStudyGuides(parsedGuides);
    } catch (error) {
      console.error('Error fetching study guides:', error);
      toast.error('Failed to load study guides');
    } finally {
      setLoading(false);
    }
  };

  const deleteStudyGuide = async (guideId: string) => {
    try {
      const { error } = await supabase
        .from('study_guides')
        .delete()
        .eq('id', guideId);

      if (error) throw error;

      setStudyGuides(prev => prev.filter(g => g.id !== guideId));
      toast.success('Study guide deleted');
      return true;
    } catch (error) {
      console.error('Error deleting study guide:', error);
      toast.error('Failed to delete study guide');
      return false;
    }
  };

  return {
    generating,
    studyGuides,
    loading,
    generateStudyGuide,
    fetchStudyGuides,
    deleteStudyGuide,
  };
}
