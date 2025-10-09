// lib/types/student_inventory_collection.ts

export interface StudentInventoryCollection {
    id: string;
    student_id: string;
    class_id: string;
    session_term_id: string;
    inventory_item_id: string;
    qty: number;
    eligible: boolean;
    received: boolean;
    received_date: string | null;
    given_by: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    notes?: string | null; 
  
    students?: {
      id: string;
      first_name: string;
      last_name: string;
      admission_number: string;
      middle_name: string | null;
      gender: "male" | "female";
      date_of_birth: string;
      class_id: string;
      guardian_name: string;
      guardian_contact: string;
      address: string;
      status: "active" | "inactive";
      created_by: string;
      created_at: string;
      updated_at: string;
      school_classes?: {
        id: string;
        name: string;
        class_teacher_id: string;
        status: "active" | "inactive";
        created_by: string;
        created_at: string;
        updated_at: string;
      };
    };
  
    school_classes?: {
      id: string;
      name: string;
      class_teacher_id: string;
      status: "active" | "inactive";
      created_by: string;
      created_at: string;
      updated_at: string;
    };
  
    academic_session_terms?: {
      id: string;
      session: string;
      name: string;
      start_date: string;
      end_date: string;
      status: "active" | "inactive";
      created_at: string;
    };
  
    inventory_items?: {
      id: string;
      name: string;
      categories?: {
        id: string;
        name: string;
        description: string;
        created_at: string;
        updated_at: string;
      };
    };
  }
  
  export interface CreateStudentInventoryCollectionInput {
    student_id: string;
    class_id: string;
    session_term_id: string;
    inventory_item_id: string;
    qty: number;
    eligible: boolean;
    received: boolean;
    received_date?: string | null;
    given_by?: string | null;
    notes?: string | null; 
  }
  
  export interface UpdateStudentInventoryCollectionInput {
    student_id?: string;
    class_id?: string;
    session_term_id?: string;
    inventory_item_id?: string;
    qty?: number;
    eligible?: boolean;
    received?: boolean;
    received_date?: string | null;
    given_by?: string | null;
    notes?: string | null; 
  }
  
  export interface StudentInventoryCollectionFilters {
    student_id?: string;
    class_id?: string;
    session_term_id?: string;
    inventory_item_id?: string;
    eligible?: boolean;
    received?: boolean;
  }
  