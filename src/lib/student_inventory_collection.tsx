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
  
  export const studentInventoryCollectionApi = {
    /**
     * Get all student inventory collections with optional filters
     */
    async getAll(
      filters?: StudentInventoryCollectionFilters
    ): Promise<StudentInventoryCollection[]> {
      const query = new URLSearchParams(
        filters as Record<string, string>
      ).toString();
      const url = `${BASE_URL}${query ? `?${query}` : ""}`;
      return fetchProxy(url);
    },
  
    /**
     * Get a single student inventory collection by ID
     */
    async getById(id: string): Promise<StudentInventoryCollection> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url);
    },
  
    /**
     * Create a new student inventory collection
     */
    async create(
      data: CreateStudentInventoryCollectionInput
    ): Promise<StudentInventoryCollection> {
      return fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Update an existing student inventory collection
     */
    async update(
      id: string,
      data: UpdateStudentInventoryCollectionInput
    ): Promise<StudentInventoryCollection> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Delete a student inventory collection
     */
    async delete(id: string): Promise<void> {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    },
  
    /**
     * Bulk upsert student inventory collections
     * Upsert (insert or update) multiple collections at once
     * Records are matched on (student_id, class_id, session_term_id, inventory_item_id)
     */
    async bulkUpsert(
      data: CreateStudentInventoryCollectionInput[]
    ): Promise<StudentInventoryCollection[]> {
      const url = `${BASE_URL}/bulk_upsert`;
      return fetchProxy(url, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  };