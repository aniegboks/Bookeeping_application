export type SchoolClassStatus = "active" | "inactive" | "archived";

export interface SchoolClass {
  id: string;
  name: string;
  status: SchoolClassStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolClassInput {
  name: string;
  status: SchoolClassStatus;
  created_by: string;
}

// New type for updates (all fields optional except you must provide at least one)
export interface UpdateSchoolClassInput {
  name?: string;
  status?: SchoolClassStatus;
  created_by?: string;
}
