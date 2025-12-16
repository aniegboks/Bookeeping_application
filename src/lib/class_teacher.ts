// lib/class_teacher.ts

import {
  ClassTeacher,
  CreateClassTeacherInput,
  UpdateClassTeacherInput,
} from "@/lib/types/class_teacher";

const BASE_URL = "/api/proxy/class_teachers";

// Error details type for better type safety
interface ErrorDetails {
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

// Custom error class for better error handling
class ClassTeacherApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: ErrorDetails
  ) {
    super(message);
    this.name = "ClassTeacherApiError";
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
        throw new ClassTeacherApiError(
          serverMessage || "Session expired. Please log in again.",
          401,
          errorData
        );
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new ClassTeacherApiError(
          serverMessage || "You don't have permission to perform this action.",
          403,
          errorData
        );
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new ClassTeacherApiError(
          serverMessage || "Teacher assignment not found.",
          404,
          errorData
        );
      }

      // Handle 409 Conflict (e.g., duplicate email or already assigned)
      if (response.status === 409) {
        throw new ClassTeacherApiError(
          serverMessage || "This teacher is already assigned to this class or email is already in use.",
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
          throw new ClassTeacherApiError(
            `Validation failed - ${validationDetails}`,
            422,
            errorData
          );
        }
        throw new ClassTeacherApiError(
          serverMessage || "Invalid data provided.",
          422,
          errorData
        );
      }

      // Handle 400 Bad Request
      if (response.status === 400) {
        throw new ClassTeacherApiError(
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
        throw new ClassTeacherApiError(
          errorMsg,
          response.status,
          errorData
        );
      }

      // Generic error for other status codes - always include server message
      throw new ClassTeacherApiError(
        serverMessage || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    // For all other successful responses, parse JSON
    return response.json();
  } catch (err) {
    // Re-throw ClassTeacherApiError as-is
    if (err instanceof ClassTeacherApiError) {
      throw err;
    }

    // Network errors or other fetch failures
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new ClassTeacherApiError(
        "Network error. Please check your internet connection and try again.",
        0
      );
    }

    // JSON parsing errors
    if (err instanceof SyntaxError) {
      throw new ClassTeacherApiError(
        "Invalid response from server. Please try again.",
        0
      );
    }

    // Unknown errors
    console.error("Unexpected error:", err);
    throw new ClassTeacherApiError(
      err instanceof Error ? err.message : "An unexpected error occurred.",
      0
    );
  }
}

export const classTeacherApi = {
  /**
   * Get all class teachers
   */
  async getAll(): Promise<ClassTeacher[]> {
    try {
      return await fetchProxy(BASE_URL);
    } catch (err) {
      if (err instanceof ClassTeacherApiError) {
        throw new ClassTeacherApiError(
          `Failed to load teacher assignments - ${err.message}`,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /**
   * Get a single class teacher by ID
   */
  async getById(id: string): Promise<ClassTeacher> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url);
    } catch (err) {
      if (err instanceof ClassTeacherApiError) {
        throw new ClassTeacherApiError(
          `Failed to load teacher assignment details - ${err.message}`,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /**
   * Create a new class teacher
   */
  async create(data: CreateClassTeacherInput): Promise<ClassTeacher> {
    try {
      return await fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof ClassTeacherApiError) {
        let contextMessage = "Failed to create teacher assignment";
        
        if (err.statusCode === 409) {
          contextMessage = `Cannot assign teacher - ${data.email} is already assigned to this class or email is already in use`;
        } else if (err.statusCode === 422) {
          contextMessage = `Cannot create teacher assignment - ${err.message}`;
        } else if (err.statusCode === 400) {
          contextMessage = `Cannot create teacher assignment - ${err.message}`;
        } else {
          contextMessage = `Failed to create teacher assignment - ${err.message}`;
        }
        
        throw new ClassTeacherApiError(
          contextMessage,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /**
   * Update an existing class teacher
   */
  async update(id: string, data: UpdateClassTeacherInput): Promise<ClassTeacher> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof ClassTeacherApiError) {
        let contextMessage = "Failed to update teacher assignment";
        
        if (err.statusCode === 404) {
          contextMessage = "Cannot update teacher assignment - assignment not found (may have been deleted)";
        } else if (err.statusCode === 409) {
          contextMessage = data.email 
            ? `Cannot update teacher assignment - email '${data.email}' is already used by another teacher`
            : "Cannot update teacher assignment - this teacher is already assigned to this class";
        } else if (err.statusCode === 422) {
          contextMessage = `Cannot update teacher assignment - ${err.message}`;
        } else if (err.statusCode === 400) {
          contextMessage = `Cannot update teacher assignment - ${err.message}`;
        } else {
          contextMessage = `Failed to update teacher assignment - ${err.message}`;
        }
        
        throw new ClassTeacherApiError(
          contextMessage,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },

  /**
   * Delete a class teacher
   */
  async delete(id: string): Promise<void> {
    try {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    } catch (err) {
      if (err instanceof ClassTeacherApiError) {
        let contextMessage = "Failed to delete teacher assignment";
        
        if (err.statusCode === 404) {
          contextMessage = "Cannot delete teacher assignment - assignment not found (may have already been deleted)";
        } else if (err.statusCode === 409) {
          contextMessage = "Cannot delete teacher assignment - this teacher has associated records (attendance, grades, etc.). Remove those records first";
        } else {
          contextMessage = `Failed to delete teacher assignment - ${err.message}`;
        }
        
        throw new ClassTeacherApiError(
          contextMessage,
          err.statusCode,
          err.details
        );
      }
      throw err;
    }
  },
};