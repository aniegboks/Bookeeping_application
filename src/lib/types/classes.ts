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
