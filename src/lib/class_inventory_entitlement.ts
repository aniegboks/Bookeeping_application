// lib/classInventoryEntitlementsApi.ts

export interface ClassInventoryEntitlement {
    id: string;
    class_id: string;
    inventory_item_id: string;
    session_term_id: string;
    quantity: number;
    notes: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface CreateClassInventoryEntitlementRequest {
    class_id: string;
    inventory_item_id: string;
    session_term_id: string;
    quantity: number;
    notes: string;
    created_by: string;
  }
  
  export interface UpdateClassInventoryEntitlementRequest
    extends Partial<CreateClassInventoryEntitlementRequest> {}
  
  export interface BulkUpsertClassInventoryEntitlementRequest {
    class_id: string;
    inventory_item_id: string;
    session_term_id: string;
    quantity: number;
    notes: string;
    created_by: string;
  }
  
  export interface GetClassInventoryEntitlementsFilters {
    class_id?: string;
    inventory_item_id?: string;
    session_term_id?: string;
  }
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
  }
  
  export class ClassInventoryEntitlementsAPI {
    private baseURL: string;
  
    constructor(baseURL = "https://inventory-backend-hm7r.onrender.com") {
      this.baseURL = baseURL;
    }
  
    private async makeRequest<T>(
      endpoint: string,
      options: RequestInit = {},
      token?: string
    ): Promise<ApiResponse<T>> {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        };
  
        if (token) headers["Authorization"] = `Bearer ${token}`;
  
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers,
        });
  
        const status = response.status;
        if (status === 204) return { status };
  
        if (!response.ok) {
          return { error: `HTTP ${status}: ${response.statusText}`, status };
        }
  
        const data = await response.json();
        return { data, status };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          status: 0,
        };
      }
    }
  
    private buildQueryParams(filters: GetClassInventoryEntitlementsFilters) {
      const params = new URLSearchParams();
      if (filters.class_id) params.append("class_id", filters.class_id);
      if (filters.inventory_item_id)
        params.append("inventory_item_id", filters.inventory_item_id);
      if (filters.session_term_id)
        params.append("session_term_id", filters.session_term_id);
      return params.toString() ? `?${params.toString()}` : "";
    }
  
    // ===== CRUD methods =====
    async getAllClassInventoryEntitlements(
      filters: GetClassInventoryEntitlementsFilters = {},
      token?: string
    ) {
      return this.makeRequest<ClassInventoryEntitlement[]>(
        `/api/v1/class_inventory_entitlements${this.buildQueryParams(filters)}`,
        {},
        token
      );
    }
  
    async getClassInventoryEntitlementById(id: string, token?: string) {
      return this.makeRequest<ClassInventoryEntitlement>(
        `/api/v1/class_inventory_entitlements/${id}`,
        {},
        token
      );
    }
  
    async createClassInventoryEntitlement(
      data: CreateClassInventoryEntitlementRequest,
      token?: string
    ) {
      return this.makeRequest<ClassInventoryEntitlement>(
        `/api/v1/class_inventory_entitlements`,
        { method: "POST", body: JSON.stringify(data) },
        token
      );
    }
  
    async updateClassInventoryEntitlement(
      id: string,
      data: UpdateClassInventoryEntitlementRequest,
      token?: string
    ) {
      return this.makeRequest<ClassInventoryEntitlement>(
        `/api/v1/class_inventory_entitlements/${id}`,
        { method: "PUT", body: JSON.stringify(data) },
        token
      );
    }
  
    async deleteClassInventoryEntitlement(id: string, token?: string) {
      return this.makeRequest<null>(
        `/api/v1/class_inventory_entitlements/${id}`,
        { method: "DELETE" },
        token
      );
    }
  
    async bulkUpsertClassInventoryEntitlements(
      entitlements: BulkUpsertClassInventoryEntitlementRequest[],
      token?: string
    ) {
      return this.makeRequest<ClassInventoryEntitlement[]>(
        `/api/v1/class_inventory_entitlements/bulk_upsert`,
        { method: "POST", body: JSON.stringify(entitlements) },
        token
      );
    }
  
    // ===== Lookup methods =====
    async getClasses(token?: string) {
      return this.makeRequest<{ id: string; name: string }[]>(
        `/api/v1/classes`,
        {},
        token
      );
    }
  
    async getInventoryItems(token?: string) {
      return this.makeRequest<{ id: string; name: string }[]>(
        `/api/v1/inventory_items`,
        {},
        token
      );
    }
  
    async getSessionTerms(token?: string) {
      return this.makeRequest<{ id: string; name: string }[]>(
        `/api/v1/session_terms`,
        {},
        token
      );
    }
  }
  
  export const classInventoryEntitlementsApi =
    new ClassInventoryEntitlementsAPI();
  