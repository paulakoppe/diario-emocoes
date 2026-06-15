export type Emotion =
  | "feliz"
  | "grato"
  | "calmo"
  | "animado"
  | "triste"
  | "ansioso"
  | "irritado"
  | "cansado"
  | "apatico";

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  emotions: Emotion[];
  intensity: number;
  text: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      diary_entries: {
        Row: DiaryEntry;
        Insert: {
          id?: string;
          user_id: string;
          emotions: Emotion[];
          intensity: number;
          text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          emotions?: Emotion[];
          intensity?: number;
          text?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
