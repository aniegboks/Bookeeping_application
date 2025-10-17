export type ClassTeacherRole =
  | "class_teacher"
  | "assistant_teacher"
  | "subject_teacher"; 

export type ClassTeacherStatus = "active" | "inactive" | "archived"; 

export interface ClassTeacher {
  id: string;
  class_id: string;
  teacher_id?: string; 
  email: string;
  name: string; 
  role: ClassTeacherRole;
  status: ClassTeacherStatus;
  assigned_at: string;
  unassigned_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClassTeacherInput {
  class_id: string;
  email: string;
  name: string; 
  role?: ClassTeacherRole;
  status?: ClassTeacherStatus;
  assigned_at?: string;
  unassigned_at?: string;
  created_by: string;
}

export interface UpdateClassTeacherInput {
  class_id?: string;
  email?: string;
  name?: string;
  role?: ClassTeacherRole;
  status?: ClassTeacherStatus;
  assigned_at?: string;
  unassigned_at?: string;
  created_by?: string;
}
