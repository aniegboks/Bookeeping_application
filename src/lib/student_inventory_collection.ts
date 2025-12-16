// lib/student_inventory_collection.ts

import {
    StudentInventoryCollection,
    CreateStudentInventoryCollectionInput,
    UpdateStudentInventoryCollectionInput,
    StudentInventoryCollectionFilters,
  } from "@/lib/types/student_inventory_collection";
  
  const BASE_URL = "/api/proxy/student_inventory_collection";
  
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
  
        // Handle authentication errors
        if (response.status === 401) {
          window.location.href = "/login";
          throw new Error("Your session has expired. Please log in again.");
        }
  
        // Handle authorization errors
        if (response.status === 403) {
          throw new Error(
            errorData?.message || "You do not have permission to perform this action. Please contact your administrator."
          );
        }
  
        // Handle validation errors
        if (response.status === 400) {
          const message = errorData?.message || "Invalid request data.";
          const details = errorData?.details 
            ? ` Details: ${JSON.stringify(errorData.details)}`
            : "";
          throw new Error(`${message}${details}`);
        }
  
        // Handle not found errors
        if (response.status === 404) {
          throw new Error(
            errorData?.message || "The requested inventory collection was not found. It may have been deleted."
          );
        }
  
        // Handle conflict errors
        if (response.status === 409) {
          throw new Error(
            errorData?.message || "This inventory item has already been assigned to this student for this term. Please update the existing record instead."
          );
        }
  
        // Handle insufficient inventory errors (custom 422)
        if (response.status === 422) {
          throw new Error(
            errorData?.message || "Insufficient inventory quantity available. Please check available stock and try again."
          );
        }
  
        // Handle server errors
        if (response.status >= 500) {
          throw new Error(
            "Server error occurred. Please try again later or contact support if the problem persists."
          );
        }
  
        // Generic error with status code
        throw new Error(
          errorData?.message || `Request failed with status ${response.status}. Please try again.`
        );
      }
  
      // Handle 204 No Content - don't try to parse JSON
      if (response.status === 204) {
        return null;
      }
  
      // For all other successful responses, parse JSON
      return response.json();
    } catch (err) {
      // Re-throw if it's already our custom error
      if (err instanceof Error) {
        throw err;
      }
      
      // Network or unexpected errors
      throw new Error(
        "Network error occurred. Please check your internet connection and try again."
      );
    }
  }
  
  export const studentInventoryCollectionApi = {
    /**
     * Get all student inventory collections with optional filters
     */
    async getAll(
      filters?: StudentInventoryCollectionFilters
    ): Promise<StudentInventoryCollection[]> {
      try {
        const query = new URLSearchParams(
          filters as Record<string, string>
        ).toString();
        const url = `${BASE_URL}${query ? `?${query}` : ""}`;
        return await fetchProxy(url);
      } catch (err) {
        throw new Error(
          err instanceof Error 
            ? err.message 
            : "Failed to load inventory collections. Please refresh the page and try again."
        );
      }
    },
  
    /**
     * Get a single student inventory collection by ID
     */
    async getById(id: string): Promise<StudentInventoryCollection> {
      try {
        const url = `${BASE_URL}/${id}`;
        return await fetchProxy(url);
      } catch (err) {
        throw new Error(
          err instanceof Error 
            ? err.message 
            : "Failed to load collection details. Please try again."
        );
      }
    },
  
    /**
     * Create a new student inventory collection
     */
    async create(
      data: CreateStudentInventoryCollectionInput
    ): Promise<StudentInventoryCollection> {
      try {
        return await fetchProxy(BASE_URL, {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (err) {
        throw new Error(
          err instanceof Error 
            ? err.message 
            : "Failed to create inventory collection. Please verify your input and available stock, then try again."
        );
      }
    },
  
    /**
     * Update an existing student inventory collection
     */
    async update(
      id: string,
      data: UpdateStudentInventoryCollectionInput
    ): Promise<StudentInventoryCollection> {
      try {
        const url = `${BASE_URL}/${id}`;
        return await fetchProxy(url, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch (err) {
        throw new Error(
          err instanceof Error 
            ? err.message 
            : "Failed to update inventory collection. Please verify your changes and available stock, then try again."
        );
      }
    },
  
    /**
     * Delete a student inventory collection
     */
    async delete(id: string): Promise<void> {
      try {
        const url = `${BASE_URL}/${id}`;
        await fetchProxy(url, {
          method: "DELETE",
        });
      } catch (err) {
        throw new Error(
          err instanceof Error 
            ? err.message 
            : "Failed to delete collection record. Please try again or check if it has already been removed."
        );
      }
    },
  
    /**
     * Bulk upsert student inventory collections
     * Upsert (insert or update) multiple collections at once
     * Records are matched on (student_id, class_id, session_term_id, inventory_item_id)
     */
    async bulkUpsert(
      data: CreateStudentInventoryCollectionInput[]
    ): Promise<StudentInventoryCollection[]> {
      try {
        const url = `${BASE_URL}/bulk_upsert`;
        return await fetchProxy(url, {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (err) {
        throw new Error(
          err instanceof Error 
            ? err.message 
            : "Failed to bulk upload inventory collections. Some items may have insufficient stock or duplicate records. Please review your data and try again."
        );
      }
    },
  };