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
  gender: Gender;
  date_of_birth: string;
  class_id: string;
  guardian_name: string;
  guardian_contact: string;
  address: string | null;
  status: StudentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Input for creating a student
export interface CreateStudentInput {
  admission_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: Gender;
  date_of_birth: string;
  class_id: string;
  guardian_name: string;
  guardian_contact: string;
  address?: string;
  status?: StudentStatus; // optional, but can be suspended/archived now
  created_by: string;
}

// Input for updating a student
export interface UpdateStudentInput {
  admission_number?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: Gender;
  date_of_birth?: string;
  class_id?: string;
  guardian_name?: string;
  guardian_contact?: string;
  address?: string;
  status?: StudentStatus; // can update to suspended/archived
  created_by?: string;
}

// Optional filters for querying students
export interface StudentFilters {
  status?: StudentStatus;
  class_id?: string;
  gender?: Gender;
}
