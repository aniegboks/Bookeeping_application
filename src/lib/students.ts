// lib/students.ts

import {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
  StudentFilters,
} from "@/lib/types/students";

const BASE_URL = "/api/proxy/students";

// Error details type for better type safety
interface ErrorDetails {
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

// Custom error class for better error handling
class StudentApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: ErrorDetails
  ) {
    super(message);
    this.name = "StudentApiError";
  }
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
      
      // Extract the actual error message from various possible formats
      const serverMessage = errorData?.message || errorData?.error || errorData?.detail;

      // Handle 401 Unauthorized
      if (response.status === 401) {
        window.location.href = "/login";
        throw new StudentApiError(
          serverMessage || "Session expired. Please log in again.",
          401,
          errorData
        );
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new StudentApiError(
          serverMessage || "You don't have permission to perform this action.",
          403,
          errorData
        );
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new StudentApiError(
          serverMessage || "Student not found.",
          404,
          errorData
        );
      }

      // Handle 409 Conflict (e.g., duplicate admission number)
      if (response.status === 409) {
        throw new StudentApiError(
          serverMessage || "A student with this admission number already exists.",
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
          throw new StudentApiError(
            `Validation failed - ${validationDetails}`,
            422,
            errorData
          );
        }
        throw new StudentApiError(
          serverMessage || "Invalid data provided.",
          422,
          errorData
        );
      }

      // Handle 400 Bad Request
      if (response.status === 400) {
        throw new StudentApiError(
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
        throw new StudentApiError(
          errorMsg,
          response.status,
          errorData
        );
      }

      // Generic error for other status codes - always include server message
      throw new StudentApiError(
        serverMessage || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    // Parse JSON for successful responses
    return response.json();
  } catch (err) {
    // Re-throw StudentApiError as-is
    if (err instanceof StudentApiError) {
      throw err;
    }

    // Network errors or other fetch failures
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new StudentApiError(
        "Network error. Please check your internet connection and try again.",
        0
      );
    }

    // JSON parsing errors
    if (err instanceof SyntaxError) {
      throw new StudentApiError(
        "Invalid response from server. Please try again.",
        0
      );
    }

    // Unknown errors
    console.error("Unexpected error:", err);
    throw new StudentApiError(
      err instanceof Error ? err.message : "An unexpected error occurred.",
      0
    );
  }
}

export const studentApi = {
  /**
   * Get all students with optional filters
   */
  async getAll(filters?: StudentFilters): Promise<Student[]> {
    try {
      const query = new URLSearchParams(
        filters as Record<string, string>
      ).toString();
      const url = `${BASE_URL}${query ? `?${query}` : ""}`;
      return await fetchProxy(url);
    } catch (err) {
      if (err instanceof StudentApiError) {
        throw new StudentApiError(
          `Failed to load students: ${err.message}`,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /**
   * Get a single student by ID
   */
  async getById(id: string): Promise<Student> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url);
    } catch (err) {
      if (err instanceof StudentApiError) {
        throw new StudentApiError(
          `Failed to load student details: ${err.message}`,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /**
   * Create a new student
   */
  async create(data: CreateStudentInput): Promise<Student> {
    try {
      return await fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof StudentApiError) {
        // For create operations, provide more specific context
        let contextMessage = "Failed to create student";
        
        if (err.statusCode === 409) {
          contextMessage = `Cannot create student - admission number '${data.admission_number}' is already in use`;
        } else if (err.statusCode === 422) {
          contextMessage = `Cannot create student - ${err.message}`;
        } else if (err.statusCode === 400) {
          contextMessage = `Cannot create student - ${err.message}`;
        } else {
          contextMessage = `Failed to create student - ${err.message}`;
        }
        
        throw new StudentApiError(
          contextMessage,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /**
   * Update an existing student
   */
  async update(id: string, data: UpdateStudentInput): Promise<Student> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof StudentApiError) {
        let contextMessage = "Failed to update student";
        
        if (err.statusCode === 404) {
          contextMessage = "Cannot update student - student not found (may have been deleted)";
        } else if (err.statusCode === 409) {
          contextMessage = `Cannot update student - admission number '${data.admission_number}' is already used by another student`;
        } else if (err.statusCode === 422) {
          contextMessage = `Cannot update student - ${err.message}`;
        } else if (err.statusCode === 400) {
          contextMessage = `Cannot update student - ${err.message}`;
        } else {
          contextMessage = `Failed to update student - ${err.message}`;
        }
        
        throw new StudentApiError(
          contextMessage,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /**
   * Delete a student
   */
  async delete(id: string): Promise<void> {
    try {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    } catch (err) {
      if (err instanceof StudentApiError) {
        let contextMessage = "Failed to delete student";
        
        if (err.statusCode === 404) {
          contextMessage = "Cannot delete student - student not found (may have already been deleted)";
        } else if (err.statusCode === 409) {
          contextMessage = "Cannot delete student - student has associated records (fees, attendance, etc.). Remove those records first";
        } else {
          contextMessage = `Failed to delete student - ${err.message}`;
        }
        
        throw new StudentApiError(
          contextMessage,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },
};