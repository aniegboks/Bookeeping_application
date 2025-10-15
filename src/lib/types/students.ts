export type Gender = "male" | "female" | "other";

export type StudentStatus =
  | "active"
  | "inactive"
  | "graduated"
  | "transferred"
  | "suspended"
  | "archived";

export interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  student_email: string | null;
  gender: Gender;
  date_of_birth: string;
  class_id: string;
  guardian_name: string;
  guardian_email: string | null;
  guardian_contact: string;
  address: string | null;
  status: StudentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentInput {
  admission_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  student_email?: string;
  gender: Gender;
  date_of_birth: string;
  class_id: string;
  guardian_name: string;
  guardian_email?: string;
  guardian_contact: string;
  address?: string;
  status?: StudentStatus;
  created_by: string;
}

export interface UpdateStudentInput {
  admission_number?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  student_email?: string;
  gender?: Gender;
  date_of_birth?: string;
  class_id?: string;
  guardian_name?: string;
  guardian_email?: string;
  guardian_contact?: string;
  address?: string;
  status?: StudentStatus;
  created_by?: string;
}

export interface StudentFilters {
  status?: StudentStatus;
  class_id?: string;
  gender?: Gender;
}
