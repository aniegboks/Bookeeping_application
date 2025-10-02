// src/lib/categories.ts (Final Corrected Code)

import { NextRequest, NextResponse } from "next/server";
import { Category } from "./types/categories"; // Ensure this path is correct

// Define the custom error class
export class CategoriesApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'CategoriesApiError';
  }
}

// Ensure environment variable is read correctly
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://inventory-backend-hm7r.onrender.com/api/v1";

// --- Token and Response Helpers ---

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

// ----------------------------------------------------------------------
// CORE API REQUEST FUNCTION (ROBUST AND FINAL)
// ----------------------------------------------------------------------

export const categoriesApiRequest = async <T>(
  endpoint: string,
  {
    method = "GET",
    token,
    body,
  }: { method?: string; token: string; body?: string }
): Promise<T> => {
  // Full URL construction
  const fullUrl = `${BASE_URL}${endpoint}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
    // Add cache control to ensure fresh data
    cache: 'no-store'
  });

  // 1. Read the body ONCE as text
  const responseText = await res.text();

  if (!res.ok) {
    let errorData = null;

    // Attempt JSON parsing only if the text is present
    if (responseText) {
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        // Parsing failed, use raw text as fallback error message.
      }
    }

    // Use message from JSON or the first 100 chars of raw text as a fallback
    throw new CategoriesApiError(
      (errorData as { message?: string })?.message || `HTTP ${res.status}: ${responseText.slice(0, 100)}`,
      res.status
    );
  }

  // 2. Check for empty body (204 No Content or zero length body)
  if (res.status === 204 || responseText.length === 0) {
    // Correctly handle 204 by returning a type that resolves the Promise without parsing
    return {} as T; 
  }

  // 3. Return the parsed JSON from the text
  try {
      return JSON.parse(responseText) as T;
  } catch (e) {
      // Catch unexpected JSON errors on otherwise successful responses
      throw new CategoriesApiError("Successful status, but response body is not valid JSON.", 500);
  }
};

// --- Exported API Call Functions ---

export async function getAll(token: string): Promise<Category[]> {
  return categoriesApiRequest<Category[]>("/categories", { method: "GET", token });
}

export async function getAllWithToken(token: string): Promise<Category[]> {
  // This is redundant but kept for completeness if used elsewhere
  return categoriesApiRequest<Category[]>("/categories", { token });
}

export const categoriesApi = {
  getTokenFromRequest,
  successResponse,
  errorResponse,
  request: categoriesApiRequest,
  getAll,
  getAllWithToken,
};