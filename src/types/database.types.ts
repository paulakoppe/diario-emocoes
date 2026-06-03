export type Emotion =
  | "feliz"
  | "grato"
  | "calmo"
  | "animado"
  | "triste"
  | "ansioso"
  | "irritado"
  | "cansado";

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
  emotion: Emotion;
  intensity: number;
  text: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      diary_entries: {
        Row: DiaryEntry;
        Insert: Omit<DiaryEntry, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<DiaryEntry>;
      };
    };
  };
}
