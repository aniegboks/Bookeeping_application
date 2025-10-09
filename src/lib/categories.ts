import { NextRequest } from "next/server";
import { Category } from "./types/categories"; // Ensure this path is correct

// ------------------------------
// Custom Error Class
// ------------------------------

export class CategoriesApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'CategoriesApiError';
  }
}

// ------------------------------
// Proxy Base URL
// ------------------------------

// For server-side requests, we need the full URL
const getProxyBaseUrl = () => {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or localhost
    return process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/proxy`
      : 'http://localhost:3000/api/proxy';
  }
  // Client-side: use relative URL
  return '/api/proxy';
};

const PROXY_BASE_URL = getProxyBaseUrl();
console.log("🔧 PROXY_BASE_URL initialized:", PROXY_BASE_URL);

// ------------------------------
// Token and Response Helpers
// ------------------------------

export const getTokenFromRequest = (req: NextRequest): string => {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new CategoriesApiError("Unauthorized", 401);
  return token;
};

export const successResponse = <T>(data: T, status = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

export const errorResponse = (message: string, status = 500): Response => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

// ------------------------------
// Core API Request Function (via Proxy)
// ------------------------------

export const categoriesApiRequest = async <T>(
  endpoint: string,
  {
    method = "GET",
    body,
  }: { method?: string; body?: string } = {}
): Promise<T> => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = `${PROXY_BASE_URL}/${cleanEndpoint}`;

  console.log("🌐 categoriesApiRequest:", { method, fullUrl });

  const res = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body,
    credentials: "include", // Important: includes cookies for authentication
    cache: "no-store",
  });

  console.log("📊 Response status:", res.status);

  // Read response text once
  const responseText = await res.text();

  if (!res.ok) {
    let errorData = null;

    // Attempt JSON parsing, ignore parse errors
    try {
      if (responseText) errorData = JSON.parse(responseText);
    } catch {
      // ignore JSON parse errors
    }

    throw new CategoriesApiError(
      (errorData as { error?: string })?.error ||
        (errorData as { message?: string })?.message ||
        `HTTP ${res.status}: ${responseText.slice(0, 100)}`,
      res.status
    );
  }

  // Handle empty response (204 or empty text)
  if (res.status === 204 || responseText.length === 0) {
    return {} as T;
  }

  // Parse JSON response
  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new CategoriesApiError(
      "Successful status, but response body is not valid JSON.",
      500
    );
  }
};

// ------------------------------
// Exported API Call Functions
// ------------------------------

export async function getAll(): Promise<Category[]> {
  return categoriesApiRequest<Category[]>("/categories", {
    method: "GET",
  });
}

export async function getAllWithToken(): Promise<Category[]> {
  // Token is now automatically handled by proxy via cookies
  return categoriesApiRequest<Category[]>("/categories");
}

export async function getById(id: string): Promise<Category> {
  return categoriesApiRequest<Category>(`/categories/${id}`);
}

export async function create(data: Partial<Category>): Promise<Category> {
  return categoriesApiRequest<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function update(id: string, data: Partial<Category>): Promise<Category> {
  return categoriesApiRequest<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function remove(id: string): Promise<void> {
  return categoriesApiRequest<void>(`/categories/${id}`, {
    method: "DELETE",
  });
}

// ------------------------------
// API Utility Object
// ------------------------------

export const categoriesApi = {
  getTokenFromRequest,
  successResponse,
  errorResponse,
  request: categoriesApiRequest,
  getAll,
  getAllWithToken,
  getById,
  create,
  update,
  delete: remove,
};