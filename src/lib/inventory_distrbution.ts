// lib/inventory_distribution.ts

import {
  InventoryDistribution,
  CreateInventoryDistributionInput,
  UpdateInventoryDistributionInput,
} from "@/lib/types/inventory_distribution";

const BASE_URL = "/api/proxy/inventory_transactions/distributions";

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

      if (response.status === 401) {
        window.location.href = "/login";
      }

      throw new Error(errorData?.message || response.statusText);
    }

    if (response.status === 204) return null;

    return response.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

export const inventoryDistributionApi = {
  async getAll(filters?: {
    class_id?: string;
    session_term_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: InventoryDistribution[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams();

    if (filters?.class_id) params.append("class_id", filters.class_id);
    if (filters?.session_term_id) params.append("session_term_id", filters.session_term_id);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const url = `${BASE_URL}/query?${params.toString()}`;
    return fetchProxy(url);
  },

  async create(
    data: CreateInventoryDistributionInput
  ): Promise<InventoryDistribution> {
    return fetchProxy(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(
    id: string,
    data: UpdateInventoryDistributionInput
  ): Promise<InventoryDistribution> {
    const url = `${BASE_URL}/${id}`;
    return fetchProxy(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
