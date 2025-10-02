// lib/types/class_inventory_entitlement.ts

export interface ClassInventoryEntitlement {
    id: string;
    class_id: string;
    inventory_item_id: string;
    session_term_id: string;
    quantity: number;
    notes: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CreateClassInventoryEntitlementInput {
    class_id: string;
    inventory_item_id: string;
    session_term_id: string;
    quantity: number;
    notes?: string;
    created_by: string;
  }
  
  export interface UpdateClassInventoryEntitlementInput {
    class_id?: string;
    inventory_item_id?: string;
    session_term_id?: string;
    quantity?: number;
    notes?: string;
    created_by?: string;
  }
  
  export interface ClassInventoryEntitlementFilters {
    class_id?: string;
    inventory_item_id?: string;
    session_term_id?: string;
  }