import {
  InventoryItem,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  InventoryItemFilters,
} from "@/lib/types/inventory_item";

const BASE_URL = "/api/proxy/inventory_items";

// Helper function to format validation errors in a user-friendly way
function formatValidationErrors(errors: Record<string, string | string[]>): string {
  const formattedErrors = Object.entries(errors).map(([field, messages]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `• ${fieldName}: ${messageArray.join(', ')}`;
  });
  
  return `Please fix the following issues:\n${formattedErrors.join('\n')}`;
}

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
      
      // 400 Bad Request
      if (response.status === 400) {
        const message = errorData?.message || errorData?.error;
        throw new Error(
          message || 
          "Invalid request. Please check your input and try again. Make sure all required fields are filled correctly."
        );
      }

      // 401 Unauthorized
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Your session has expired. Please log in again to continue.");
      }

      // 403 Forbidden
      if (response.status === 403) {
        throw new Error(
          errorData?.message || 
          "Permission denied. You don't have access to perform this action. Please contact your administrator to request the necessary permissions."
        );
      }

      // 404 Not Found
      if (response.status === 404) {
        throw new Error(
          errorData?.message || 
          "Item not found. The inventory item you're trying to access may have been deleted or moved. Please refresh the page and try again."
        );
      }

      // 409 Conflict
      if (response.status === 409) {
        const message = errorData?.message || errorData?.error;
        if (message && message.toLowerCase().includes('sku')) {
          throw new Error(
            `Duplicate SKU detected. ${message}. Please use a unique SKU for this inventory item.`
          );
        }
        if (message && message.toLowerCase().includes('name')) {
          throw new Error(
            `Duplicate name detected. ${message}. Please use a unique name for this inventory item.`
          );
        }
        throw new Error(
          message || 
          "This inventory item already exists in the system. Please check the SKU and name fields to ensure they are unique."
        );
      }

      // 422 Validation Error
      if (response.status === 422) {
        const validationErrors = errorData?.errors || errorData?.validation_errors;
        
        if (validationErrors && typeof validationErrors === 'object' && Object.keys(validationErrors).length > 0) {
          throw new Error(formatValidationErrors(validationErrors));
        }
        
        const message = errorData?.message || errorData?.error;
        if (message) {
          throw new Error(`Validation error: ${message}`);
        }
        
        throw new Error(
          "Validation failed. Please check the following:\n" +
          "• All required fields are filled in\n" +
          "• SKU is unique and follows the correct format\n" +
          "• Prices are positive numbers\n" +
          "• All dropdown selections are valid\n" +
          "• Text fields don't exceed maximum length"
        );
      }

      // 500 Server Error
      if (response.status >= 500 && response.status < 600) {
        const message = errorData?.message || errorData?.error;
        throw new Error(
          `Server error: ${message || 'Something went wrong on our end'}. Please try again in a few moments. If this problem continues, contact support with this error code: ${response.status}.`
        );
      }

      // Generic error for other status codes
      const message = errorData?.message || errorData?.error;
      throw new Error(
        message || 
        `Request failed (Error ${response.status}). ${response.statusText}. Please try again or contact support if the issue persists.`
      );
    }

    // Handle 204 No Content (successful deletion)
    if (response.status === 204) {
      return null;
    }

    // Parse JSON for successful responses
    return response.json();
  } catch (err) {
    // Network errors or fetch failures
    if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('network'))) {
      throw new Error(
        "Network connection error. Please check the following:\n" +
        "• Your internet connection is active\n" +
        "• You're not behind a restrictive firewall\n" +
        "• The server is accessible\n" +
        "Then try again."
      );
    }
    
    // Re-throw existing errors with their detailed messages
    throw err;
  }
}

export const inventoryItemApi = {
  async getAll(filters?: InventoryItemFilters): Promise<InventoryItem[]> {
    try {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      const url = `${BASE_URL}${query ? `?${query}` : ""}`;
      return await fetchProxy(url);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Unable to load inventory items.\n\n${error.message}`);
      }
      throw new Error("Unable to load inventory items. An unexpected error occurred. Please refresh the page and try again.");
    }
  },

  async getById(id: string): Promise<InventoryItem> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Unable to retrieve inventory item.\n\n${error.message}`);
      }
      throw new Error("Unable to retrieve inventory item. An unexpected error occurred. Please try again.");
    }
  },

  async create(data: CreateInventoryItemInput): Promise<InventoryItem> {
    try {
      return await fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Unable to create inventory item.\n\n${error.message}`);
      }
      throw new Error("Unable to create inventory item. An unexpected error occurred. Please check your input and try again.");
    }
  },

  async update(id: string, data: UpdateInventoryItemInput): Promise<InventoryItem> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Unable to update inventory item.\n\n${error.message}`);
      }
      throw new Error("Unable to update inventory item. An unexpected error occurred. Please check your changes and try again.");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Unable to delete inventory item.\n\n${error.message}`);
      }
      throw new Error("Unable to delete inventory item. An unexpected error occurred. Please try again.");
    }
  },
};