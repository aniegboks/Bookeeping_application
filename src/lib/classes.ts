// lib/school_class.ts

import {
  SchoolClass,
  CreateSchoolClassInput,
  UpdateSchoolClassInput,
} from "@/lib/types/classes";

const BASE_URL = "/api/proxy/school_classes";

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

      // Handle 401 Unauthorized
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Your session has expired. Please log in again.");
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error(
          errorData?.message || 
          "You don't have permission to perform this action. Please contact your administrator."
        );
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new Error(
          errorData?.message || 
          "The requested class could not be found. It may have been deleted."
        );
      }

      // Handle 409 Conflict (e.g., duplicate class name)
      if (response.status === 409) {
        throw new Error(
          errorData?.message || 
          "A class with this name already exists. Please choose a different name."
        );
      }

      // Handle 422 Validation Error
      if (response.status === 422) {
        throw new Error(
          errorData?.message || 
          "The information provided is invalid. Please check all required fields and try again."
        );
      }

      // Handle 500 Server Error
      if (response.status === 500) {
        throw new Error(
          "An unexpected error occurred on the server. Please try again later or contact support if the problem persists."
        );
      }

      // Handle 503 Service Unavailable
      if (response.status === 503) {
        throw new Error(
          "The service is temporarily unavailable. Please try again in a few moments."
        );
      }

      // Generic error with details if available
      throw new Error(
        errorData?.message || 
        errorData?.error || 
        `Request failed with status ${response.status}. Please try again or contact support.`
      );
    }

    // Handle 204 No Content - don't try to parse JSON
    if (response.status === 204) {
      return null;
    }

    // For all other successful responses, parse JSON
    return response.json();
  } catch (err) {
    // If it's already our formatted error, rethrow it
    if (err instanceof Error) {
      throw err;
    }

    // Handle network errors
    if (err instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    }

    // Generic fallback
    throw new Error(
      "An unexpected error occurred. Please try again or contact support if the problem persists."
    );
  }
}

export const schoolClassApi = {
  /**
   * Get all school classes
   */
  async getAll(): Promise<SchoolClass[]> {
    try {
      return await fetchProxy(BASE_URL);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to load classes: ${err.message}`);
      }
      throw new Error("Failed to load classes. Please refresh the page and try again.");
    }
  },

  /**
   * Get a single school class by ID
   */
  async getById(id: string): Promise<SchoolClass> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to load class details: ${err.message}`);
      }
      throw new Error("Failed to load class details. Please try again.");
    }
  },

  /**
   * Create a new school class
   */
  async create(data: CreateSchoolClassInput): Promise<SchoolClass> {
    try {
      return await fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to create class: ${err.message}`);
      }
      throw new Error("Failed to create class. Please check your input and try again.");
    }
  },

  /**
   * Update an existing school class
   */
  async update(id: string, data: UpdateSchoolClassInput): Promise<SchoolClass> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to update class: ${err.message}`);
      }
      throw new Error("Failed to update class. Please check your changes and try again.");
    }
  },

  /**
   * Delete a school class
   */
  async delete(id: string): Promise<void> {
    try {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to delete class: ${err.message}`);
      }
      throw new Error("Failed to delete class. Please try again or contact support.");
    }
  },
};