import {
  InventoryItem,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  InventoryItemFilters,
} from "@/lib/types/inventory_item";

const BASE_URL = "/api/proxy/inventory_items";

async function fetchProxy(url: string, options: RequestInit = {}) {
  try {
      const response = await fetch(url, {
          ...options,
          headers: {
              "Content-Type": "application/json",
              ...(options.headers || {}),
          },
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          
          // 401 check, handled by the server proxy response
          if (response.status === 401) {
              window.location.href = "/login";
          }

          throw new Error(errorData?.message || response.statusText);
      }

      // Handle 204 No Content - don't try to parse JSON
      if (response.status === 204) {
          return null;
      }

      // For all other successful responses, parse JSON
      return response.json();
  } catch (err) {
      console.error("Fetch failed:", err);
      throw err;
  }
}

export const inventoryItemApi = {
  async getAll(filters?: InventoryItemFilters): Promise<InventoryItem[]> {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      const url = `${BASE_URL}${query ? `?${query}` : ""}`;
      return fetchProxy(url);
  },

  async getById(id: string): Promise<InventoryItem> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url);
  },

  async create(data: CreateInventoryItemInput): Promise<InventoryItem> {
      return fetchProxy(BASE_URL, {
          method: "POST",
          body: JSON.stringify(data),
      });
  },

  async update(id: string, data: UpdateInventoryItemInput): Promise<InventoryItem> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url, {
          method: "PUT",
          body: JSON.stringify(data),
      });
  },

  async delete(id: string): Promise<void> {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
          method: "DELETE",
      });
  },
};