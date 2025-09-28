// lib/class_inventory.ts
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
  
  const BASE_URL = "https://inventory-backend-hm7r.onrender.com/api/v1/class_inventory_entitlements";
  
  // Fetch all entitlements
  export async function getEntitlements(token?: string, filters?: Record<string, string>) {
    const query = filters ? "?" + new URLSearchParams(filters).toString() : "";
    const res = await fetch(BASE_URL + query, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to fetch entitlements");
    return res.json() as Promise<ClassInventoryEntitlement[]>;
  }
  
  // Create entitlement
  export async function createEntitlement(data: Partial<ClassInventoryEntitlement>, token?: string) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create entitlement");
    return res.json() as Promise<ClassInventoryEntitlement>;
  }
  
  // Update entitlement
  export async function updateEntitlement(id: string, data: Partial<ClassInventoryEntitlement>, token?: string) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update entitlement");
    return res.json() as Promise<ClassInventoryEntitlement>;
  }
  
  // Delete entitlement
  export async function deleteEntitlement(id: string, token?: string) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to delete entitlement");
    return true;
  }
  