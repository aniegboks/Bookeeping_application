// types/academic_session.ts
export interface AcademicSession {
  id: string;
  session: string;
  name: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  status: "active" | "inactive"; // assuming only two statuses
  created_at: string; // ISO datetime string
}

// For creating/updating (input data)
export interface CreateAcademicSessionData {
  session: string;
  name: string;
  start_date: string;
  end_date: string;
  status: "active" | "inactive";
}
