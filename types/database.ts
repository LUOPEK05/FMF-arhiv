export type DocumentCategory =
  | "izpit"
  | "kolokvij"
  | "vaje"
  | "literatura"
  | "projekt"
  | "drugo";

export type DocumentStatus = "pending" | "approved" | "rejected";

export interface Faculty {
  id: string;
  name: string;
  created_at: string;
}

export interface Major {
  id: string;
  faculty_id: string;
  name: string;
  created_at: string;
}

export type StudyLevel = "dodiplomski" | "magistrski" | "doktorski";

export interface Subject {
  id: string;
  major_id: string;
  name: string;
  year: number | null;
  semester: number | null;
  level: StudyLevel;
  created_at: string;
  // joined field (populated client-side via nested select())
  major?: Major;
}

export interface Professor {
  id: string;
  full_name: string;
  title: string | null;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  subject_id: string;
  professor_id: string | null;
  category: DocumentCategory;
  title: string;
  academic_year: string | null;
  file_url: string;
  file_size_bytes: number | null;
  uploaded_by: string | null;
  status: DocumentStatus;
  upvotes: number;
  downvotes: number;
  created_at: string;
  // joined fields (populated client-side via select())
  subject?: Subject;
  professor?: Professor | null;
}

// Minimal Supabase generated-type stand-in.
// Replace with `supabase gen types typescript` output once your project is live.
export interface Database {
  public: {
    Tables: {
      faculties: { Row: Faculty; Insert: Partial<Faculty>; Update: Partial<Faculty> };
      majors: { Row: Major; Insert: Partial<Major>; Update: Partial<Major> };
      subjects: { Row: Subject; Insert: Partial<Subject>; Update: Partial<Subject> };
      professors: { Row: Professor; Insert: Partial<Professor>; Update: Partial<Professor> };
      documents: { Row: DocumentRow; Insert: Partial<DocumentRow>; Update: Partial<DocumentRow> };
    };
  };
}