// lib/student.ts

import {
    Student,
    CreateStudentInput,
    UpdateStudentInput,
    StudentFilters,
  } from "@/lib/types/students";
  
  const BASE_URL = "/api/proxy/students";
  
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
  
        // 401 check, handled by the server proxy response
        if (response.status === 401) {
          window.location.href = "/login";
        }
  
        throw new Error(errorData?.message || response.statusText);
      }
  
      // Handle 204 No Content - don't try to parse JSON
      if (response.status === 204) {
        return null;
      }
  
      // For all other successful responses, parse JSON
      return response.json();
    } catch (err) {
      console.error("Fetch failed:", err);
      throw err;
    }
  }
  
  export const studentApi = {
    /**
     * Get all students with optional filters
     */
    async getAll(filters?: StudentFilters): Promise<Student[]> {
      const query = new URLSearchParams(
        filters as Record<string, string>
      ).toString();
      const url = `${BASE_URL}${query ? `?${query}` : ""}`;
      return fetchProxy(url);
    },
  
    /**
     * Get a single student by ID
     */
    async getById(id: string): Promise<Student> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url);
    },
  
    /**
     * Create a new student
     */
    async create(data: CreateStudentInput): Promise<Student> {
      return fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Update an existing student
     */
    async update(id: string, data: UpdateStudentInput): Promise<Student> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Delete a student
     */
    async delete(id: string): Promise<void> {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    },
  };