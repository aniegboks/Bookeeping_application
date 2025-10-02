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
  
  export const schoolClassApi = {
    /**
     * Get all school classes
     */
    async getAll(): Promise<SchoolClass[]> {
      return fetchProxy(BASE_URL);
    },
  
    /**
     * Get a single school class by ID
     */
    async getById(id: string): Promise<SchoolClass> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url);
    },
  
    /**
     * Create a new school class
     */
    async create(data: CreateSchoolClassInput): Promise<SchoolClass> {
      return fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Update an existing school class
     */
    async update(id: string, data: UpdateSchoolClassInput): Promise<SchoolClass> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Delete a school class
     */
    async delete(id: string): Promise<void> {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    },
  };