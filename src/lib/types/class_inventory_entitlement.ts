// lib/types/class_inventory_entitlement.ts

/**
 * ClassInventoryEntitlement represents the full entitlement record
 * returned from the API (includes all fields)
 */
export interface ClassInventoryEntitlement {
  id: string;
  class_id: string;
  inventory_item_id: string;
  session_term_id: string;
  quantity: number;
  notes?: string;
  created_by: string;  // This is set automatically by the backend from JWT token
  created_at: string;
  updated_at: string;
}

/**
 * CreateClassInventoryEntitlementInput is used when creating a new entitlement
 * Note: created_by is NOT included - it's automatically set by the backend from the auth token
 */
export interface CreateClassInventoryEntitlementInput {
  class_id: string;
  inventory_item_id: string;
  session_term_id: string;
  quantity: number;
  notes?: string;
  // created_by is omitted - backend sets it from JWT token
}

/**
 * UpdateClassInventoryEntitlementInput is used when updating an existing entitlement
 * All fields are optional except the ones you want to update
 */
export interface UpdateClassInventoryEntitlementInput {
  class_id?: string;
  inventory_item_id?: string;
  session_term_id?: string;
  quantity?: number;
  notes?: string;
  // created_by cannot be updated
}

/**
 * ClassInventoryEntitlementFilters for querying entitlements
 */
export interface ClassInventoryEntitlementFilters {
  class_id?: string;
  inventory_item_id?: string;
  session_term_id?: string;
  created_by?: string;
}