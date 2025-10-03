// lib/class_teacher.ts

import {
    ClassTeacher,
    CreateClassTeacherInput,
    UpdateClassTeacherInput,
  } from "@/lib/types/class_teacher";
  
  const BASE_URL = "/api/proxy/class_teachers";
  
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
  
  export const classTeacherApi = {
    /**
     * Get all class teachers
     */
    async getAll(): Promise<ClassTeacher[]> {
      return fetchProxy(BASE_URL);
    },
  
    /**
     * Get a single class teacher by ID
     */
    async getById(id: string): Promise<ClassTeacher> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url);
    },
  
    /**
     * Create a new class teacher
     */
    async create(data: CreateClassTeacherInput): Promise<ClassTeacher> {
      return fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Update an existing class teacher
     */
    async update(id: string, data: UpdateClassTeacherInput): Promise<ClassTeacher> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Delete a class teacher
     */
    async delete(id: string): Promise<void> {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    },
  };