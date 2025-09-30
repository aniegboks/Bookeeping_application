import { NextRequest } from "next/server";
import { Category } from "./types/categories";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://inventory-backend-hm7r.onrender.com/api/v1";

export class CategoriesApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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

export const categoriesApiRequest = async <T>(
  endpoint: string,
  {
    method = "GET",
    token,
    body,
  }: { method?: string; token: string; body?: string }
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new CategoriesApiError(
      (errorData as { message?: string })?.message || `HTTP ${res.status}`,
      res.status
    );
  }

  return res.status === 204 ? ({} as T) : (await res.json()) as T;
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new CategoriesApiError(
      errorData?.message || response.statusText,
      response.status
    );
  }

  return response.json();
}

export async function getAll(): Promise<Category[]> {
  return fetchWithAuth(`${BASE_URL}/categories`, {
    method: "GET",
    credentials: "include",
  });
}

export async function getAllWithToken(token: string): Promise<Category[]> {
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
