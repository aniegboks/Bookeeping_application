// lib/suppliers.ts

import {
  Supplier,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  SupplierBalance,
} from "@/lib/types/suppliers";

const BASE_URL = "/api/proxy/suppliers";

// Error details type for better type safety
interface ErrorDetails {
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

// Custom error class for better error handling
class SupplierApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: ErrorDetails
  ) {
    super(message);
    this.name = "SupplierApiError";
  }
}

/**
 * Generic fetch wrapper for the proxy API with enhanced error handling
 */
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
      
      // Extract the actual error message from various possible formats
      const serverMessage = errorData?.message || errorData?.error || errorData?.detail;

      // Handle 401 Unauthorized
      if (response.status === 401) {
        window.location.href = "/login";
        throw new SupplierApiError(
          serverMessage || "Session expired. Please log in again.",
          401,
          errorData
        );
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new SupplierApiError(
          serverMessage || "You don't have permission to perform this action.",
          403,
          errorData
        );
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new SupplierApiError(
          serverMessage || "Supplier not found.",
          404,
          errorData
        );
      }

      // Handle 409 Conflict (e.g., duplicate supplier name or email)
      if (response.status === 409) {
        throw new SupplierApiError(
          serverMessage || "A supplier with this information already exists.",
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
          throw new SupplierApiError(
            `Validation failed - ${validationDetails}`,
            422,
            errorData
          );
        }
        throw new SupplierApiError(
          serverMessage || "Invalid data provided.",
          422,
          errorData
        );
      }

      // Handle 400 Bad Request
      if (response.status === 400) {
        throw new SupplierApiError(
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
        throw new SupplierApiError(
          errorMsg,
          response.status,
          errorData
        );
      }

      // Generic error for other status codes - always include server message
      throw new SupplierApiError(
        serverMessage || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (err) {
    // Re-throw SupplierApiError as-is
    if (err instanceof SupplierApiError) {
      throw err;
    }

    // Network errors or other fetch failures
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new SupplierApiError(
        "Network error. Please check your internet connection and try again.",
        0
      );
    }

    // JSON parsing errors
    if (err instanceof SyntaxError) {
      throw new SupplierApiError(
        "Invalid response from server. Please try again.",
        0
      );
    }

    // Unknown errors
    console.error("Unexpected error:", err);
    throw new SupplierApiError(
      err instanceof Error ? err.message : "An unexpected error occurred.",
      0
    );
  }
}

/**
 * Supplier API methods
 */
export const supplierApi = {
  /** Get all suppliers */
  async getAll(): Promise<Supplier[]> {
    try {
      return await fetchProxy(BASE_URL);
    } catch (err) {
      if (err instanceof SupplierApiError) {
        throw new SupplierApiError(
          `Failed to load suppliers - ${err.message}`,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /** Get supplier by ID */
  async getById(id: string): Promise<Supplier> {
    try {
      return await fetchProxy(`${BASE_URL}/${id}`);
    } catch (err) {
      if (err instanceof SupplierApiError) {
        throw new SupplierApiError(
          `Failed to load supplier details - ${err.message}`,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /** Create new supplier */
  async create(data: CreateSupplierPayload): Promise<Supplier> {
    try {
      return await fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof SupplierApiError) {
        let contextMessage = "Failed to create supplier";
        
        if (err.statusCode === 409) {
          contextMessage = data.email 
            ? `Cannot create supplier - a supplier with email '${data.email}' already exists`
            : `Cannot create supplier - a supplier with name '${data.name}' already exists`;
        } else if (err.statusCode === 422) {
          contextMessage = `Cannot create supplier - ${err.message}`;
        } else if (err.statusCode === 400) {
          contextMessage = `Cannot create supplier - ${err.message}`;
        } else {
          contextMessage = `Failed to create supplier - ${err.message}`;
        }
        
        throw new SupplierApiError(
          contextMessage,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /** Update supplier */
  async update(id: string, data: UpdateSupplierPayload): Promise<Supplier> {
    try {
      return await fetchProxy(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof SupplierApiError) {
        let contextMessage = "Failed to update supplier";
        
        if (err.statusCode === 404) {
          contextMessage = "Cannot update supplier - supplier not found (may have been deleted)";
        } else if (err.statusCode === 409) {
          contextMessage = data.email 
            ? `Cannot update supplier - email '${data.email}' is already used by another supplier`
            : `Cannot update supplier - name '${data.name}' is already used by another supplier`;
        } else if (err.statusCode === 422) {
          contextMessage = `Cannot update supplier - ${err.message}`;
        } else if (err.statusCode === 400) {
          contextMessage = `Cannot update supplier - ${err.message}`;
        } else {
          contextMessage = `Failed to update supplier - ${err.message}`;
        }
        
        throw new SupplierApiError(
          contextMessage,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /** Delete supplier */
  async delete(id: string): Promise<void> {
    try {
      await fetchProxy(`${BASE_URL}/${id}`, { method: "DELETE" });
    } catch (err) {
      if (err instanceof SupplierApiError) {
        let contextMessage = "Failed to delete supplier";
        
        if (err.statusCode === 404) {
          contextMessage = "Cannot delete supplier - supplier not found (may have already been deleted)";
        } else if (err.statusCode === 409) {
          contextMessage = "Cannot delete supplier - this supplier has associated transactions or purchase orders. Remove those records first";
        } else {
          contextMessage = `Failed to delete supplier - ${err.message}`;
        }
        
        throw new SupplierApiError(
          contextMessage,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /** Get supplier balances */
  async getBalances(): Promise<SupplierBalance[]> {
    try {
      return await fetchProxy(`${BASE_URL}/balances`);
    } catch (err) {
      if (err instanceof SupplierApiError) {
        throw new SupplierApiError(
          `Failed to load supplier balances - ${err.message}`,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },
};