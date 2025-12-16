// lib/subCategoriesApi.ts

export interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

const BASE_URL = "https://inventory-backend-hm7r.onrender.com/api/v1/sub_categories";

// Error details type for better type safety
interface ErrorDetails {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

// Custom error class for better error handling
class SubCategoryApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: ErrorDetails
  ) {
    super(message);
    this.name = "SubCategoryApiError";
  }
}

// Helper to attach token to headers
function getAuthHeaders(token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// Enhanced fetch wrapper with detailed error handling
async function fetchWithErrorHandling(
  url: string,
  options: RequestInit,
  operationContext: string
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      // Extract the actual error message from various possible formats
      const serverMessage = errorData?.message || errorData?.error || errorData?.detail;

      // Handle 401 Unauthorized
      if (response.status === 401) {
        throw new SubCategoryApiError(
          serverMessage || "Session expired. Please log in again.",
          401,
          errorData
        );
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new SubCategoryApiError(
          serverMessage || "You don't have permission to perform this action.",
          403,
          errorData
        );
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new SubCategoryApiError(
          serverMessage || "Sub-category not found.",
          404,
          errorData
        );
      }

      // Handle 409 Conflict (e.g., duplicate name)
      if (response.status === 409) {
        throw new SubCategoryApiError(
          serverMessage || "A sub-category with this name already exists in this category.",
          409,
          errorData
        );
      }

      // Handle 422 Validation Error
      if (response.status === 422) {
        if (errorData?.errors) {
          const validationDetails = Object.entries(errorData.errors)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join("; ");
          throw new SubCategoryApiError(
            `Validation failed - ${validationDetails}`,
            422,
            errorData
          );
        }
        throw new SubCategoryApiError(
          serverMessage || "Invalid data provided.",
          422,
          errorData
        );
      }

      // Handle 400 Bad Request
      if (response.status === 400) {
        throw new SubCategoryApiError(
          serverMessage || "Invalid request. Please check your input.",
          400,
          errorData
        );
      }

      // Handle 500 Server Error
      if (response.status >= 500) {
        const errorMsg = serverMessage 
          ? `Server error: ${serverMessage}` 
          : "Server error occurred. Please try again later or contact support if the problem persists.";
        throw new SubCategoryApiError(
          errorMsg,
          response.status,
          errorData
        );
      }

      // Generic error for other status codes - always include server message
      throw new SubCategoryApiError(
        serverMessage || `${operationContext} failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return response;
  } catch (err) {
    // Re-throw SubCategoryApiError as-is
    if (err instanceof SubCategoryApiError) {
      throw err;
    }

    // Network errors or other fetch failures
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new SubCategoryApiError(
        "Network error. Please check your internet connection and try again.",
        0
      );
    }

    // JSON parsing errors
    if (err instanceof SyntaxError) {
      throw new SubCategoryApiError(
        "Invalid response from server. Please try again.",
        0
      );
    }

    // Unknown errors
    console.error("Unexpected error:", err);
    throw new SubCategoryApiError(
      err instanceof Error ? err.message : "An unexpected error occurred.",
      0
    );
  }
}

// Fetch all sub-categories
export async function fetchAllSubCategories(token?: string): Promise<SubCategory[]> {
  try {
    const response = await fetchWithErrorHandling(
      BASE_URL,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      },
      "Loading sub-categories"
    );
    
    return response.json();
  } catch (err) {
    if (err instanceof SubCategoryApiError) {
      throw new SubCategoryApiError(
        `Failed to load sub-categories: ${err.message}`,
        err.statusCode,
        err.details
      );
    }
    throw err;
  }
}

// Fetch a single sub-category by ID
export async function fetchSubCategoryById(token: string, id: string): Promise<SubCategory> {
  try {
    const response = await fetchWithErrorHandling(
      `${BASE_URL}/${id}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      },
      "Loading sub-category"
    );
    
    return response.json();
  } catch (err) {
    if (err instanceof SubCategoryApiError) {
      throw new SubCategoryApiError(
        `Failed to load sub-category details: ${err.message}`,
        err.statusCode,
        err.details
      );
    }
    throw err;
  }
}

// Create a sub-category
export async function createSubCategory(token: string, data: Partial<SubCategory>): Promise<SubCategory> {
  try {
    const response = await fetchWithErrorHandling(
      BASE_URL,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      },
      "Creating sub-category"
    );
    
    return response.json();
  } catch (err) {
    if (err instanceof SubCategoryApiError) {
      let contextMessage = "Failed to create sub-category";
      
      if (err.statusCode === 409) {
        contextMessage = `Cannot create sub-category - a sub-category named '${data.name}' already exists in this category`;
      } else if (err.statusCode === 422) {
        contextMessage = `Cannot create sub-category - ${err.message}`;
      } else if (err.statusCode === 400) {
        contextMessage = `Cannot create sub-category - ${err.message}`;
      } else {
        contextMessage = `Failed to create sub-category - ${err.message}`;
      }
      
      throw new SubCategoryApiError(
        contextMessage,
        err.statusCode,
        err.details
      );
    }
    throw err;
  }
}

// Update sub-category
export async function updateSubCategory(token: string, id: string, data: Partial<SubCategory>): Promise<SubCategory> {
  try {
    const response = await fetchWithErrorHandling(
      `${BASE_URL}/${id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      },
      "Updating sub-category"
    );
    
    return response.json();
  } catch (err) {
    if (err instanceof SubCategoryApiError) {
      let contextMessage = "Failed to update sub-category";
      
      if (err.statusCode === 404) {
        contextMessage = "Cannot update sub-category - sub-category not found (may have been deleted)";
      } else if (err.statusCode === 409) {
        contextMessage = `Cannot update sub-category - a sub-category named '${data.name}' already exists in this category`;
      } else if (err.statusCode === 422) {
        contextMessage = `Cannot update sub-category - ${err.message}`;
      } else if (err.statusCode === 400) {
        contextMessage = `Cannot update sub-category - ${err.message}`;
      } else {
        contextMessage = `Failed to update sub-category - ${err.message}`;
      }
      
      throw new SubCategoryApiError(
        contextMessage,
        err.statusCode,
        err.details
      );
    }
    throw err;
  }
}

// Delete sub-category
export async function deleteSubCategory(token: string, id: string): Promise<boolean> {
  try {
    await fetchWithErrorHandling(
      `${BASE_URL}/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(token),
      },
      "Deleting sub-category"
    );
    
    return true; // success
  } catch (err) {
    if (err instanceof SubCategoryApiError) {
      let contextMessage = "Failed to delete sub-category";
      
      if (err.statusCode === 404) {
        contextMessage = "Cannot delete sub-category - sub-category not found (may have already been deleted)";
      } else if (err.statusCode === 409) {
        contextMessage = "Cannot delete sub-category - this sub-category has associated items. Remove those items first";
      } else {
        contextMessage = `Failed to delete sub-category - ${err.message}`;
      }
      
      throw new SubCategoryApiError(
        contextMessage,
        err.statusCode,
        err.details
      );
    }
    throw err;
  }
}

export const subCategoryApi = {
  getAll: fetchAllSubCategories,
  fetchById: fetchSubCategoryById,
  create: createSubCategory,
  update: updateSubCategory,
  delete: deleteSubCategory,
};