import { NextRequest } from "next/server";
import { Category } from "./types/categories"; // Ensure this path is correct

// ------------------------------
// Custom Error Class
// ------------------------------

export class CategoriesApiError extends Error {
  status: number;
  originalError?: unknown;
  
  constructor(message: string, status: number, originalError?: unknown) {
    super(message);
    this.status = status;
    this.originalError = originalError;
    this.name = 'CategoriesApiError';
  }
}

// ------------------------------
// Error Response Interface
// ------------------------------

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: unknown;
}

// ------------------------------
// Parse API Error Helper
// ------------------------------

function parseApiError(error: Error | CategoriesApiError | { message?: string }, statusCode?: number): string {
  // Network errors
  if (!navigator.onLine) {
    return "No internet connection. Please check your network and try again.";
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  // Handle timeout errors
  if (error.message === 'AbortError' || error.message?.includes('timeout')) {
    return "Request timed out. Please try again.";
  }

  // Parse response errors based on status code
  if (statusCode === 400) {
    return error.message || "Invalid request. Please check your input and try again.";
  }
  
  if (statusCode === 401) {
    return "Your session has expired. Redirecting to login...";
  }
  
  if (statusCode === 403) {
    return "You don't have permission to perform this action.";
  }
  
  if (statusCode === 404) {
    return "Category not found. It may have been deleted.";
  }
  
  if (statusCode === 409) {
    return error.message || "A category with this name already exists. Please use a different name.";
  }
  
  if (statusCode === 422) {
    return error.message || "Invalid data provided. Please check your input.";
  }
  
  if (statusCode === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  
  if (statusCode && statusCode >= 500) {
    return "Server error. Our team has been notified. Please try again later.";
  }

  // Return specific error message if available and user-friendly
  if (error.message && 
      !error.message.includes('Internal') && 
      !error.message.includes('Server Error') &&
      !error.message.includes('Failed to fetch') &&
      !error.message.startsWith('HTTP')) {
    return error.message;
  }

  // Default fallback
  return "Something went wrong. Please try again or contact support if the issue persists.";
}

// ------------------------------
// Validate Category Data
// ------------------------------

function validateCategoryData(name: string): void {
  const trimmedName = name?.trim();
  
  if (!trimmedName) {
    throw new CategoriesApiError("Category name is required and cannot be empty.", 400);
  }
  
  if (trimmedName.length < 2) {
    throw new CategoriesApiError("Category name must be at least 2 characters long.", 400);
  }
  
  if (trimmedName.length > 100) {
    throw new CategoriesApiError("Category name cannot exceed 100 characters.", 400);
  }

  // Check for invalid characters
  const invalidChars = /[<>]/;
  if (invalidChars.test(trimmedName)) {
    throw new CategoriesApiError("Category name contains invalid characters.", 400);
  }
}

// ------------------------------
// Proxy Base URL
// ------------------------------

const getProxyBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/proxy`
      : 'http://localhost:3000/api/proxy';
  }
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
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = `${PROXY_BASE_URL}/${cleanEndpoint}`;

  console.log("🌐 categoriesApiRequest:", { method, fullUrl });

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body,
      credentials: "include",
      cache: "no-store",
    });

    console.log("📊 Response status:", res.status);

    // Read response text once
    const responseText = await res.text();

    if (!res.ok) {
      let errorData: ApiErrorResponse | null = null;

      // Attempt JSON parsing, ignore parse errors
      try {
        if (responseText) {
          errorData = JSON.parse(responseText) as ApiErrorResponse;
        }
      } catch {
        // ignore JSON parse errors
      }

      // Handle auth issues - redirect to login
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = "/login";
        }
      }

      // Extract error message
      const errorMessage = errorData?.error || 
                          errorData?.message || 
                          responseText.slice(0, 100);

      // Create user-friendly error message
      const userFriendlyMessage = parseApiError(
        { message: errorMessage },
        res.status
      );

      throw new CategoriesApiError(
        userFriendlyMessage,
        res.status,
        errorData
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
        "Server returned invalid data format. Please try again.",
        500
      );
    }
  } catch (err) {
    console.error("Categories API Fetch failed:", {
      url: fullUrl,
      method,
      error: err,
      timestamp: new Date().toISOString()
    });

    // Re-throw CategoriesApiError as-is
    if (err instanceof CategoriesApiError) {
      throw err;
    }

    // Wrap other errors with user-friendly message
    const error = err as Error;
    throw new CategoriesApiError(
      parseApiError(error, undefined),
      500,
      err
    );
  }
};

// ------------------------------
// Exported API Call Functions
// ------------------------------

export async function getAll(): Promise<Category[]> {
  try {
    return await categoriesApiRequest<Category[]>("/categories", {
      method: "GET",
    });
  } catch (error) {
    throw error; // Error already has user-friendly message
  }
}

export async function getAllWithToken(): Promise<Category[]> {
  try {
    return await categoriesApiRequest<Category[]>("/categories");
  } catch (error) {
    throw error;
  }
}

export async function getById(id: string): Promise<Category> {
  try {
    if (!id || !id.trim()) {
      throw new CategoriesApiError("Category ID is required.", 400);
    }

    return await categoriesApiRequest<Category>(`/categories/${id}`);
  } catch (error) {
    throw error;
  }
}

export async function create(data: Partial<Category>): Promise<Category> {
  try {
    // Validate category name
    if (data.name) {
      validateCategoryData(data.name);
    } else {
      throw new CategoriesApiError("Category name is required.", 400);
    }

    return await categoriesApiRequest<Category>("/categories", {
      method: "POST",
      body: JSON.stringify({ name: data.name.trim() }),
    });
  } catch (error) {
    throw error;
  }
}

export async function update(id: string, data: Partial<Category>): Promise<Category> {
  try {
    if (!id || !id.trim()) {
      throw new CategoriesApiError("Category ID is required for updates.", 400);
    }

    // Validate category name if provided
    if (data.name) {
      validateCategoryData(data.name);
    }

    return await categoriesApiRequest<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data.name ? { name: data.name.trim() } : data),
    });
  } catch (error) {
    throw error;
  }
}

export async function remove(id: string): Promise<void> {
  try {
    if (!id || !id.trim()) {
      throw new CategoriesApiError("Category ID is required for deletion.", 400);
    }

    return await categoriesApiRequest<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    throw error;
  }
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