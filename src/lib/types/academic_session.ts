export interface AcademicSession {
    id: string;
    session: string;
    name: string;
    start_date: string;
    end_date: string;
    status: "active" | "inactive";
    created_at: string;
  }
  
  export interface CreateAcademicSessionData {
    session: string;
    name: string;
    start_date: string;
    end_date: string;
    status: "active" | "inactive";
  }
  