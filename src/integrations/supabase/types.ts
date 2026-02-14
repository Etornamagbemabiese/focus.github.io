export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          attended_at: string
          group_id: string
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          attended_at?: string
          group_id: string
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          attended_at?: string
          group_id?: string
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_event_mappings: {
        Row: {
          calendar_event_id: string
          calendar_provider: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          series_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_event_id: string
          calendar_provider?: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          series_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_event_id?: string
          calendar_provider?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          series_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      class_todos: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          linked_deadline_id: string | null
          linked_session_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_deadline_id?: string | null
          linked_session_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_deadline_id?: string | null
          linked_session_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_todos_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_todos_linked_deadline_id_fkey"
            columns: ["linked_deadline_id"]
            isOneToOne: false
            referencedRelation: "deadlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_todos_linked_session_id_fkey"
            columns: ["linked_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_website: string | null
          code: string | null
          color: string
          created_at: string
          end_time: string
          id: string
          location: string
          meeting_days: number[]
          name: string
          notes: string | null
          office_hours_day: string | null
          office_hours_location: string | null
          office_hours_time: string | null
          professor_email: string | null
          professor_name: string
          section_number: string | null
          semester_end: string
          semester_start: string
          start_time: string
          syllabus_parsed_at: string | null
          syllabus_url: string | null
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_website?: string | null
          code?: string | null
          color?: string
          created_at?: string
          end_time: string
          id?: string
          location: string
          meeting_days?: number[]
          name: string
          notes?: string | null
          office_hours_day?: string | null
          office_hours_location?: string | null
          office_hours_time?: string | null
          professor_email?: string | null
          professor_name: string
          section_number?: string | null
          semester_end: string
          semester_start: string
          start_time: string
          syllabus_parsed_at?: string | null
          syllabus_url?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_website?: string | null
          code?: string | null
          color?: string
          created_at?: string
          end_time?: string
          id?: string
          location?: string
          meeting_days?: number[]
          name?: string
          notes?: string | null
          office_hours_day?: string | null
          office_hours_location?: string | null
          office_hours_time?: string | null
          professor_email?: string | null
          professor_name?: string
          section_number?: string | null
          semester_end?: string
          semester_start?: string
          start_time?: string
          syllabus_parsed_at?: string | null
          syllabus_url?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          calendar_event_id: string | null
          class_id: string
          created_at: string
          deadline_type: string
          description: string | null
          due_date: string
          id: string
          source: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          calendar_event_id?: string | null
          class_id: string
          created_at?: string
          deadline_type?: string
          description?: string | null
          due_date: string
          id?: string
          source?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          calendar_event_id?: string | null
          class_id?: string
          created_at?: string
          deadline_type?: string
          description?: string | null
          due_date?: string
          id?: string
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendar_events: {
        Row: {
          all_day: boolean
          calendar_id: string
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          recurrence_rule: string | null
          start_time: string
          title: string
          uid: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          calendar_id: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          recurrence_rule?: string | null
          start_time: string
          title: string
          uid: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          calendar_id?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          recurrence_rule?: string | null
          start_time?: string
          title?: string
          uid?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_calendar_events_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "external_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendars: {
        Row: {
          color: string
          created_at: string
          enabled: boolean
          ics_url: string
          id: string
          last_synced_at: string | null
          name: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          enabled?: boolean
          ics_url: string
          id?: string
          last_synced_at?: string | null
          name: string
          provider?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          enabled?: boolean
          ics_url?: string
          id?: string
          last_synced_at?: string | null
          name?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      extracted_todos: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          note_id: string
          priority: string
          status: string
          title: string
          transferred_to_assignments: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          note_id: string
          priority?: string
          status?: string
          title: string
          transferred_to_assignments?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          note_id?: string
          priority?: string
          status?: string
          title?: string
          transferred_to_assignments?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extracted_todos_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          audio_url: string | null
          class_id: string | null
          content: string | null
          created_at: string
          duration_seconds: number | null
          event_id: string | null
          id: string
          keywords: string[] | null
          session_id: string | null
          title: string | null
          topics: string[] | null
          transcription: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          class_id?: string | null
          content?: string | null
          created_at?: string
          duration_seconds?: number | null
          event_id?: string | null
          id?: string
          keywords?: string[] | null
          session_id?: string | null
          title?: string | null
          topics?: string[] | null
          transcription?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          class_id?: string | null
          content?: string | null
          created_at?: string
          duration_seconds?: number | null
          event_id?: string | null
          id?: string
          keywords?: string[] | null
          session_id?: string | null
          title?: string | null
          topics?: string[] | null
          transcription?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          graduation_year: number | null
          id: string
          major: string | null
          school_name: string | null
          storage_limit_bytes: number
          storage_used_bytes: number
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          graduation_year?: number | null
          id?: string
          major?: string | null
          school_name?: string | null
          storage_limit_bytes?: number
          storage_used_bytes?: number
          subscription_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          graduation_year?: number | null
          id?: string
          major?: string | null
          school_name?: string | null
          storage_limit_bytes?: number
          storage_used_bytes?: number
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          attendance: string | null
          calendar_event_id: string | null
          class_id: string
          created_at: string
          end_time: string
          id: string
          location: string | null
          notes: string | null
          session_date: string
          start_time: string
          topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attendance?: string | null
          calendar_event_id?: string | null
          class_id: string
          created_at?: string
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          session_date: string
          start_time: string
          topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attendance?: string | null
          calendar_event_id?: string | null
          class_id?: string
          created_at?: string
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          session_date?: string
          start_time?: string
          topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_notes: {
        Row: {
          group_id: string
          id: string
          note_id: string
          shared_at: string
          shared_by: string
        }
        Insert: {
          group_id: string
          id?: string
          note_id: string
          shared_at?: string
          shared_by: string
        }
        Update: {
          group_id?: string
          id?: string
          note_id?: string
          shared_at?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_notes_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_notes_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          group_id: string
          id: string
          invited_by: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          group_id: string
          id?: string
          invited_by: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          group_id?: string
          id?: string
          invited_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_invites_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          id: string
          invite_code: string
          name: string
          owner_id: string
          school_name: string | null
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string
          name: string
          owner_id: string
          school_name?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string
          name?: string
          owner_id?: string
          school_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_groups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      study_guides: {
        Row: {
          class_id: string | null
          flashcards: Json | null
          generated_at: string
          group_id: string | null
          id: string
          key_concepts: Json | null
          practice_questions: Json | null
          source_note_ids: string[] | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id?: string | null
          flashcards?: Json | null
          generated_at?: string
          group_id?: string | null
          id?: string
          key_concepts?: Json | null
          practice_questions?: Json | null
          source_note_ids?: string[] | null
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string | null
          flashcards?: Json | null
          generated_at?: string
          group_id?: string | null
          id?: string
          key_concepts?: Json | null
          practice_questions?: Json | null
          source_note_ids?: string[] | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_guides_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_guides_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_owner: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
