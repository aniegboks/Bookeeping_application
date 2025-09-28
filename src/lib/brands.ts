export class BrandsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface Brand {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandData {
  name: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BRANDS_URL;
if (!BASE_URL) throw new Error("NEXT_PUBLIC_BRANDS_URL is not defined in .env");

// Helper function calling **Next.js API route**
const brandsApiCall = async <T>(endpoint = "", options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new BrandsApiError(
      errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  if (response.status === 204) return {} as T;

  return response.json();
};

// CRUD methods
export const brandsApi = {
  getAll: (): Promise<Brand[]> => brandsApiCall(""),
  getById: (id: string): Promise<Brand> => brandsApiCall(`/${id}`),
  create: (data: CreateBrandData): Promise<Brand> =>
    brandsApiCall("", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreateBrandData>): Promise<Brand> =>
    brandsApiCall(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> => brandsApiCall(`/${id}`, { method: "DELETE" }),
} as const;
