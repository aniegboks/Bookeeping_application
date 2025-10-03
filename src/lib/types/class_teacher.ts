export type ClassTeacherRole = 
  | "class_teacher" 
  | "assistant_teacher" 
  | "subject_teacher"; // expand roles

export type ClassTeacherStatus = "active" | "inactive";

export interface ClassTeacher {
  id: string;
  class_id: string;
  session_term_id: string;
  teacher_id: string;
  email: string;
  name: string; // required now
  role: ClassTeacherRole;
  status: ClassTeacherStatus;
  assigned_at: string;
  unassigned_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClassTeacherInput {
  class_id: string;
  session_term_id: string;
  email: string;
  name: string; // <-- ADD THIS
  role?: ClassTeacherRole;
  status?: ClassTeacherStatus;
  assigned_at?: string;
  unassigned_at?: string;
  created_by: string;
}

export interface UpdateClassTeacherInput {
  class_id?: string;
  session_term_id?: string;
  email?: string;
  name?: string; // <-- ADD THIS
  role?: ClassTeacherRole;
  status?: ClassTeacherStatus;
  assigned_at?: string;
  unassigned_at?: string;
  created_by?: string;
}
