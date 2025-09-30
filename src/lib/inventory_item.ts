// lib/inventory-item-api.ts
import {
  InventoryItem,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  InventoryItemFilters,
} from "@/lib/types/inventory_item";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://inventory-backend-hm7r.onrender.com/api/v1";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token"); // Or cookies if SSR
  console.log("Fetching URL:", url);
  console.log("Token:", token);
  console.log("Options before headers:", options);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  console.log("Final headers:", headers);

  try {
    console.log("this is the options", options, url);
    const response = await fetch(url, { ...options, headers, cache: "no-store" });
    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Error response data:", errorData);
      throw new Error(errorData?.message || response.statusText);
    }

    const data = await response.json();
    console.log("Response data:", data);
    return data;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

export const inventoryItemApi = {
  async getAll(filters?: InventoryItemFilters): Promise<InventoryItem[]> {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    const url = `${BASE_URL}/inventory-items${query ? `?${query}` : ""}`;
    console.log("getAll URL:", url);
    return fetchWithAuth(url);
  },

  async getById(id: string): Promise<InventoryItem> {
    const url = `${BASE_URL}/inventory-items/${id}`;
    console.log("getById URL:", url);
    return fetchWithAuth(url);
  },

  async create(data: CreateInventoryItemInput): Promise<InventoryItem> {
    console.log("Creating inventory item:", data);
    const url = `${BASE_URL}/inventory-items`;
    return fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateInventoryItemInput): Promise<InventoryItem> {
    console.log("Updating inventory item:", id, data);
    const url = `${BASE_URL}/inventory-items/${id}`;
    return fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    console.log("Deleting inventory item:", id);
    const url = `${BASE_URL}/inventory-items/${id}`;
    await fetchWithAuth(url, { method: "DELETE" });
  },
};
