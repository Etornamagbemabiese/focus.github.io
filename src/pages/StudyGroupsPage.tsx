import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Link2, 
  Loader2,
  BookOpen,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudyGroups, StudyGroup } from '@/hooks/useStudyGroups';
import { useStudyGuide, StudyGuide } from '@/hooks/useStudyGuide';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CreateGroupDialog } from '@/components/study-groups/CreateGroupDialog';
import { JoinGroupDialog } from '@/components/study-groups/JoinGroupDialog';
import { GroupCard } from '@/components/study-groups/GroupCard';
import { GroupDetailSheet } from '@/components/study-groups/GroupDetailSheet';
import { StudyGuideViewer } from '@/components/study-guide/StudyGuideViewer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function StudyGroupsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    groups,
    loading: groupsLoading,
    createGroup,
    joinGroupByCode,
    inviteByEmail,
    getGroupMembers,
    getSharedNotes,
    getAttendanceLeaderboard,
    findGroupsBySchool,
    leaveGroup,
  } = useStudyGroups();
  const {
    studyGuides,
    loading: guidesLoading,
    generating,
    generateStudyGuide,
    fetchStudyGuides,
  } = useStudyGuide();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [groupDetailOpen, setGroupDetailOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<StudyGuide | null>(null);
  const [guideViewerOpen, setGuideViewerOpen] = useState(false);
  
  // For generating study guides
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClassForGuide, setSelectedClassForGuide] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStudyGuides();
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('classes')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name');
    setClasses(data || []);
  };

  const handleGenerateGuide = async () => {
    if (!selectedClassForGuide) {
      toast.error('Please select a class');
      return;
    }
    
    const guide = await generateStudyGuide({ classId: selectedClassForGuide });
    if (guide) {
      setSelectedGuide(guide);
      setGuideViewerOpen(true);
      fetchStudyGuides();
    }
  };

  const handleGroupClick = (group: StudyGroup) => {
    setSelectedGroup(group);
    setGroupDetailOpen(true);
  };

  const handleGuideClick = (guide: StudyGuide) => {
    setSelectedGuide(guide);
    setGuideViewerOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MobileMenuButton />
            <Users className="h-8 w-8 text-primary" />
            Study Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with classmates and generate AI study guides
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setJoinDialogOpen(true)}>
            <Link2 className="h-4 w-4 mr-2" />
            Join Group
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList>
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" />
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="guides" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Study Guides
          </TabsTrigger>
        </TabsList>

        {/* Study Groups Tab */}
        <TabsContent value="groups">
          {groupsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : groups.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No study groups yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create a group to share notes and compete with classmates
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setJoinDialogOpen(true)}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Join Group
                  </Button>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isOwner={group.owner_id === user?.id}
                  onClick={() => handleGroupClick(group)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Study Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          {/* Generate New Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate Study Guide
              </CardTitle>
              <CardDescription>
                AI will condense your notes into summaries, flashcards, and practice questions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Select
                value={selectedClassForGuide}
                onValueChange={setSelectedClassForGuide}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerateGuide}
                disabled={generating || !selectedClassForGuide}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate
              </Button>
            </CardContent>
          </Card>

          {/* Existing Guides */}
          {guidesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : studyGuides.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No study guides yet</h3>
                <p className="text-muted-foreground text-center">
                  Generate your first study guide from your class notes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyGuides.map((guide) => (
                <Card
                  key={guide.id}
                  variant="interactive"
                  onClick={() => handleGuideClick(guide)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-base">{guide.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      Generated {new Date(guide.generated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {guide.key_concepts?.length || 0} concepts
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {guide.practice_questions?.length || 0} questions
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {guide.flashcards?.length || 0} flashcards
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateGroup={createGroup}
      />
      <JoinGroupDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        onJoinByCode={joinGroupByCode}
        onFindBySchool={findGroupsBySchool}
      />
      <GroupDetailSheet
        open={groupDetailOpen}
        onOpenChange={setGroupDetailOpen}
        group={selectedGroup}
        currentUserId={user?.id || null}
        onGetMembers={getGroupMembers}
        onGetSharedNotes={getSharedNotes}
        onGetLeaderboard={getAttendanceLeaderboard}
        onInviteByEmail={inviteByEmail}
        onLeaveGroup={leaveGroup}
      />
      <StudyGuideViewer
        open={guideViewerOpen}
        onOpenChange={setGuideViewerOpen}
        guide={selectedGuide}
      />
    </div>
  );
}
