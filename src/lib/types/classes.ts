// lib/types/school_class.ts

export type SchoolClassStatus = "active" | "inactive";

export interface SchoolClass {
  id: string;
  name: string;
  class_teacher_id: string;
  status: SchoolClassStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolClassInput {
  name: string;
  class_teacher_id: string;
  status?: SchoolClassStatus;
  created_by: string;
}

export interface UpdateSchoolClassInput {
  name?: string;
  class_teacher_id?: string;
  status?: SchoolClassStatus;
  created_by?: string;
}