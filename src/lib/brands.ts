// lib/brands.ts

export interface Brand {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandData {
  name: string;
}

const BASE_URL = "/api/proxy/brands";

// --- Universal fetch proxy helper ---
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

      // Handle auth issues
      if (response.status === 401) {
        window.location.href = "/login";
      }

      throw new Error(errorData?.message || response.statusText);
    }

    // Handle no content
    if (response.status === 204) return null;

    return response.json();
  } catch (err) {
    console.error("Brands API Fetch failed:", err);
    throw err;
  }
}

// --- CRUD methods ---
export const brandsApi = {
  /**
   * Get all brands
   */
  async getAll(): Promise<Brand[]> {
    return fetchProxy(BASE_URL);
  },

  /**
   * Get brand by ID
   */
  async getById(id: string): Promise<Brand> {
    const url = `${BASE_URL}/${id}`;
    return fetchProxy(url);
  },

  /**
   * Create new brand
   */
  async create(data: CreateBrandData): Promise<Brand> {
    return fetchProxy(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update brand
   */
  async update(id: string, data: Partial<CreateBrandData>): Promise<Brand> {
    const url = `${BASE_URL}/${id}`;
    return fetchProxy(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete brand
   */
  async delete(id: string): Promise<void> {
    const url = `${BASE_URL}/${id}`;
    await fetchProxy(url, { method: "DELETE" });
  },
} as const;
