// Types for Supplier management

export interface Supplier {
    id: string;
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
    notes?: string;
    created_by?: string;
    created_at?: string; // Made optional
    updated_at?: string; // Made optional
}

export interface CreateSupplierPayload {
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
    notes?: string;
}

export interface UpdateSupplierPayload {
    name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
    notes?: string;
}

export interface SupplierBalance {
    supplier_id: string;
    supplier_name: string;
    balance: number;
}