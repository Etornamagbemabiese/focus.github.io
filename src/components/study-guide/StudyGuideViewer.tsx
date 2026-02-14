import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Brain,
  HelpCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  StudyGuide,
  KeyConcept,
  PracticeQuestion,
  Flashcard,
} from '@/hooks/useStudyGuide';

interface StudyGuideViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: StudyGuide | null;
}

export function StudyGuideViewer({
  open,
  onOpenChange,
  guide,
}: StudyGuideViewerProps) {
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showQuestionAnswer, setShowQuestionAnswer] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Map<number, boolean>>(new Map());

  if (!guide) return null;

  const flashcards = guide.flashcards || [];
  const questions = guide.practice_questions || [];
  const concepts = guide.key_concepts || [];

  const resetFlashcards = () => {
    setFlashcardIndex(0);
    setShowAnswer(false);
    setKnownCards(new Set());
  };

  const nextFlashcard = (known: boolean) => {
    if (known) {
      setKnownCards(prev => new Set([...prev, flashcardIndex]));
    }
    setShowAnswer(false);
    if (flashcardIndex < flashcards.length - 1) {
      setFlashcardIndex(flashcardIndex + 1);
    }
  };

  const prevFlashcard = () => {
    setShowAnswer(false);
    if (flashcardIndex > 0) {
      setFlashcardIndex(flashcardIndex - 1);
    }
  };

  const currentFlashcard = flashcards[flashcardIndex];
  const currentQuestion = questions[questionIndex];
  const flashcardProgress = flashcards.length > 0 ? ((flashcardIndex + 1) / flashcards.length) * 100 : 0;
  const questionProgress = questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <SheetTitle>{guide.title}</SheetTitle>
          </div>
        </SheetHeader>

        <Tabs defaultValue="summary" className="mt-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="summary" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="concepts" className="gap-1.5">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Concepts</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="gap-1.5">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Cards</span>
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="mt-4">
            <ScrollArea className="h-[500px]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {guide.summary?.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-3 text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Concepts Tab */}
          <TabsContent value="concepts" className="mt-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {concepts.map((concept, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {i + 1}
                        </Badge>
                        {concept.term}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {concept.definition}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Question {questionIndex + 1} of {questions.length}</span>
                <span>{answeredQuestions.size} answered</span>
              </div>
              <Progress value={questionProgress} className="h-2" />

              {currentQuestion && (
                <Card className="min-h-[300px]">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit text-xs mb-2">
                      {currentQuestion.type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'}
                    </Badge>
                    <CardTitle className="text-base font-normal leading-relaxed">
                      {currentQuestion.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border transition-colors ${
                              showQuestionAnswer && option === currentQuestion.answer
                                ? 'bg-green-500/10 border-green-500/50'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {option}
                          </div>
                        ))}
                      </div>
                    )}

                    {showQuestionAnswer && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-4">
                        <p className="text-sm font-medium mb-1">Answer:</p>
                        <p className="text-sm">{currentQuestion.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuestionIndex(Math.max(0, questionIndex - 1));
                    setShowQuestionAnswer(false);
                  }}
                  disabled={questionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowQuestionAnswer(!showQuestionAnswer)}
                >
                  {showQuestionAnswer ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {showQuestionAnswer ? 'Hide' : 'Show'} Answer
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuestionIndex(Math.min(questions.length - 1, questionIndex + 1));
                    setShowQuestionAnswer(false);
                  }}
                  disabled={questionIndex === questions.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Card {flashcardIndex + 1} of {flashcards.length}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">{knownCards.size} known</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={resetFlashcards}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
              <Progress value={flashcardProgress} className="h-2" />

              {currentFlashcard && (
                <Card
                  className="min-h-[250px] flex items-center justify-center cursor-pointer transition-all hover:shadow-md"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  <CardContent className="p-8 text-center">
                    <Badge variant="outline" className="mb-4">
                      {showAnswer ? 'Answer' : 'Question'}
                    </Badge>
                    <p className="text-lg">
                      {showAnswer ? currentFlashcard.back : currentFlashcard.front}
                    </p>
                    {!showAnswer && (
                      <p className="text-xs text-muted-foreground mt-4">
                        Click to reveal answer
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevFlashcard}
                  disabled={flashcardIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => nextFlashcard(false)}
                  disabled={flashcardIndex === flashcards.length - 1}
                >
                  <X className="h-4 w-4 mr-1" />
                  Still Learning
                </Button>

                <Button
                  variant="outline"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => nextFlashcard(true)}
                  disabled={flashcardIndex === flashcards.length - 1}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Got It
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setShowAnswer(false);
                    setFlashcardIndex(Math.min(flashcards.length - 1, flashcardIndex + 1));
                  }}
                  disabled={flashcardIndex === flashcards.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
