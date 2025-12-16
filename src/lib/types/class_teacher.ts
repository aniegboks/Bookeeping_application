// lib/types/class_teacher.ts

// Updated to match API documentation - role is "CLASS_TEACHER" in uppercase
export type ClassTeacherRole = "CLASS_TEACHER";

export type ClassTeacherStatus = "active" | "inactive" | "archived";

export interface ClassTeacher {
  id: string;
  class_id: string;
  teacher_id?: string;
  name: string;
  email: string;
  role: ClassTeacherRole;
  status: ClassTeacherStatus;
  assigned_at?: string;
  unassigned_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClassTeacherInput {
  class_id: string;
  name: string;
  email: string;
  role: ClassTeacherRole;
  status: ClassTeacherStatus;
}

export interface UpdateClassTeacherInput {
  class_id?: string;
  name?: string;
  email?: string;
  role?: ClassTeacherRole;
  status?: ClassTeacherStatus;
}