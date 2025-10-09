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
// Environment
// ------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://inventory-backend-hm7r.onrender.com/api/v1";

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
// Core API Request Function
// ------------------------------

export const categoriesApiRequest = async <T>(
  endpoint: string,
  {
    method = "GET",
    token,
    body,
  }: { method?: string; token: string; body?: string }
): Promise<T> => {
  const fullUrl = `${BASE_URL}${endpoint}`;

  const res = await fetch(fullUrl, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  // Read response text once
  const responseText = await res.text();

  if (!res.ok) {
    let errorData = null;

    // Attempt JSON parsing, ignore parse errors
    try {
      if (responseText) errorData = JSON.parse(responseText);
    } catch (_) {
      // ignore JSON parse errors
    }

    throw new CategoriesApiError(
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
  } catch (_) {
    throw new CategoriesApiError(
      "Successful status, but response body is not valid JSON.",
      500
    );
  }
};

// ------------------------------
// Exported API Call Functions
// ------------------------------

export async function getAll(token: string): Promise<Category[]> {
  return categoriesApiRequest<Category[]>("/categories", {
    method: "GET",
    token,
  });
}

export async function getAllWithToken(token: string): Promise<Category[]> {
  // Redundant wrapper if needed elsewhere
  return categoriesApiRequest<Category[]>("/categories", { token });
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
};
