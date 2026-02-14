import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  class_id: string | null;
  school_name: string | null;
  owner_id: string;
  invite_code: string;
  created_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface SharedNote {
  id: string;
  note_id: string;
  group_id: string;
  shared_by: string;
  shared_at: string;
  note?: {
    id: string;
    title: string | null;
    content: string | null;
    created_at: string;
  };
  sharer?: {
    display_name: string | null;
    email: string;
  };
}

export interface AttendanceLeaderboard {
  user_id: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  attendance_count: number;
}

export function useStudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGroups([]);
        setLoading(false);
        return;
      }

      // Fetch groups where user is owner
      const { data: ownedGroups, error: ownedError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      // Fetch groups where user is member
      const { data: memberships, error: memberError } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const memberGroupIds = memberships?.map(m => m.group_id) || [];
      let memberGroups: StudyGroup[] = [];

      if (memberGroupIds.length > 0) {
        const { data: mGroups, error: mGroupsError } = await supabase
          .from('study_groups')
          .select('*')
          .in('id', memberGroupIds);

        if (mGroupsError) throw mGroupsError;
        memberGroups = mGroups || [];
      }

      // Combine and dedupe
      const allGroups = [...(ownedGroups || []), ...memberGroups];
      const uniqueGroups = Array.from(new Map(allGroups.map(g => [g.id, g])).values());

      // Get member counts
      const groupsWithCounts = await Promise.all(
        uniqueGroups.map(async (group) => {
          const { count } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
          
          return { ...group, member_count: (count || 0) + 1 }; // +1 for owner
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error fetching study groups:', error);
      toast.error('Failed to load study groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (data: {
    name: string;
    description?: string;
    class_id?: string;
    school_name?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: group, error } = await supabase
        .from('study_groups')
        .insert({
          name: data.name,
          description: data.description || null,
          class_id: data.class_id || null,
          school_name: data.school_name || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Study group created!');
      await fetchGroups();
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create study group');
      return null;
    }
  };

  const joinGroupByCode = async (inviteCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find the group
      const { data: group, error: findError } = await supabase
        .from('study_groups')
        .select('id, name, owner_id')
        .eq('invite_code', inviteCode.toLowerCase().trim())
        .single();

      if (findError || !group) {
        toast.error('Invalid invite code');
        return null;
      }

      // Check if already a member or owner
      if (group.owner_id === user.id) {
        toast.error('You are the owner of this group');
        return null;
      }

      const { data: existing } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        toast.error('You are already a member of this group');
        return null;
      }

      // Join the group
      const { error: joinError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (joinError) throw joinError;

      toast.success(`Joined "${group.name}"!`);
      await fetchGroups();
      return group;
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
      return null;
    }
  };

  const inviteByEmail = async (groupId: string, email: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('study_group_invites')
        .insert({
          group_id: groupId,
          email: email.toLowerCase().trim(),
          invited_by: user.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This email has already been invited');
          return false;
        }
        throw error;
      }

      toast.success('Invitation sent!');
      return true;
    } catch (error) {
      console.error('Error inviting:', error);
      toast.error('Failed to send invitation');
      return false;
    }
  };

  const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    try {
      const { data: members, error } = await supabase
        .from('study_group_members')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;

      // Fetch profiles for members
      const memberIds = members?.map(m => m.user_id) || [];
      if (memberIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('user_id', memberIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return (members || []).map(m => ({
        ...m,
        profile: profileMap.get(m.user_id) || undefined,
      }));
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  };

  const getSharedNotes = async (groupId: string): Promise<SharedNote[]> => {
    try {
      const { data, error } = await supabase
        .from('shared_notes')
        .select(`
          *,
          notes:note_id (id, title, content, created_at)
        `)
        .eq('group_id', groupId)
        .order('shared_at', { ascending: false });

      if (error) throw error;

      // Get sharer profiles
      const sharerIds = [...new Set(data?.map(s => s.shared_by) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', sharerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return (data || []).map(s => ({
        ...s,
        note: s.notes as SharedNote['note'],
        sharer: profileMap.get(s.shared_by) || undefined,
      }));
    } catch (error) {
      console.error('Error fetching shared notes:', error);
      return [];
    }
  };

  const shareNote = async (noteId: string, groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('shared_notes')
        .insert({
          note_id: noteId,
          group_id: groupId,
          shared_by: user.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This note is already shared with the group');
          return false;
        }
        throw error;
      }

      toast.success('Note shared with group!');
      return true;
    } catch (error) {
      console.error('Error sharing note:', error);
      toast.error('Failed to share note');
      return false;
    }
  };

  const getAttendanceLeaderboard = async (groupId: string): Promise<AttendanceLeaderboard[]> => {
    try {
      // Get group info to get the associated class
      const { data: group } = await supabase
        .from('study_groups')
        .select('class_id, owner_id')
        .eq('id', groupId)
        .single();

      if (!group) return [];

      // Get all group members including owner
      const { data: members } = await supabase
        .from('study_group_members')
        .select('user_id')
        .eq('group_id', groupId);

      const allUserIds = [group.owner_id, ...(members?.map(m => m.user_id) || [])];

      // Get attendance counts for each member
      const leaderboard: AttendanceLeaderboard[] = [];

      for (const userId of allUserIds) {
        // Count sessions attended (from sessions table where attendance = 'present')
        let attendanceCount = 0;
        
        if (group.class_id) {
          const { count } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('class_id', group.class_id)
            .eq('attendance', 'present');
          
          attendanceCount = count || 0;
        }

        // Get profile info
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, email, avatar_url')
          .eq('user_id', userId)
          .single();

        leaderboard.push({
          user_id: userId,
          display_name: profile?.display_name || null,
          email: profile?.email || 'Unknown',
          avatar_url: profile?.avatar_url || null,
          attendance_count: attendanceCount,
        });
      }

      // Sort by attendance count descending
      return leaderboard.sort((a, b) => b.attendance_count - a.attendance_count);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  };

  const findGroupsBySchool = async (schoolName: string): Promise<StudyGroup[]> => {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .ilike('school_name', `%${schoolName}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding groups:', error);
      return [];
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Left the group');
      await fetchGroups();
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
      return false;
    }
  };

  return {
    groups,
    loading,
    refetch: fetchGroups,
    createGroup,
    joinGroupByCode,
    inviteByEmail,
    getGroupMembers,
    getSharedNotes,
    shareNote,
    getAttendanceLeaderboard,
    findGroupsBySchool,
    leaveGroup,
  };
}
