// lib/categories.ts
import { NextRequest } from "next/server";

export class CategoriesApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Extract token from NextRequest cookies
export const getTokenFromRequest = (req: NextRequest): string => {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new CategoriesApiError("Unauthorized", 401);
  return token;
};

// Standardized success response
export const successResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
};

// Standardized error response
export const errorResponse = (message: string, status = 500) => {
  return new Response(JSON.stringify({ error: message }), { status, headers: { "Content-Type": "application/json" } });
};

// Generic API request to backend
export const categoriesApiRequest = async (
  endpoint: string,
  { method = "GET", token, body }: { method?: string; token: string; body?: string }
) => {
  const baseUrl = "https://inventory-backend-hm7r.onrender.com/api/v1";
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new CategoriesApiError(errorData?.message || `HTTP ${res.status}`, res.status);
  }

  // Return empty object for 204 DELETE
  if (res.status === 204) return {};
  return res.json();
};
