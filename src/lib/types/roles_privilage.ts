// types/role-privileges.ts - UPDATED VERSION

export type PrivilegeStatus = "active" | "inactive";

export interface RolePrivilege {
    id: string;
    role_code: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface CreateRolePrivilegePayload {
    role_code: string;
    description: string;
    status: PrivilegeStatus;
}

export interface UpdateRolePrivilegePayload {
    role_code?: string;
    description?: string;
    status?: string;
}

export interface PrivilegeItem {
    description: string;
    status: boolean | PrivilegeStatus;
}

export interface UpsertRolePrivilegesPayload {
    role: string;
    privileges: {
        [resource: string]: PrivilegeItem[];
    };
}

// FIXED: Changed to use PrivilegeItem[] instead of inline type
export interface BulkUpsertRolePrivilegesPayload {
    role: string;
    privileges: {
        [resource: string]: PrivilegeItem[];  // Now uses PrivilegeItem which accepts boolean | PrivilegeStatus
    };
}

export interface GroupedPrivileges {
    privileges: {
        [resource: string]: Array<{
            description: string;
            status: PrivilegeStatus;
        }>;
    };
}

export type RolePrivilegeResource = 
    | "brands"
    | "categories"
    | "sub_categories"
    | "uoms"
    | "academic_session_terms"
    | "school_classes"
    | "students"
    | "class_teachers"
    | "inventory_items"
    | "inventory_transactions"
    | "inventory_summary"
    | "suppliers"
    | "supplier_transactions"
    | "class_inventory_entitlements"
    | "student_inventory_collection"
    | "auth"
    | "users"
    | "notifications"
    | "roles"
    | "role_privileges";