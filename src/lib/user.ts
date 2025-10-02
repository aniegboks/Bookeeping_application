// lib/user.ts

import {
    User,
    CreateUserInput,
    UpdateUserInput,
  } from "@/lib/types/user";
  
  const BASE_URL = "/api/proxy/users";
  
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
  
  export const userApi = {
    /**
     * Get all users
     */
    async getAll(): Promise<User[]> {
      return fetchProxy(BASE_URL);
    },
  
    /**
     * Get a single user by ID
     */
    async getById(id: string): Promise<User> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url);
    },
  
    /**
     * Create a new user
     */
    async create(data: CreateUserInput): Promise<User> {
      return fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Update an existing user
     */
    async update(id: string, data: UpdateUserInput): Promise<User> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Delete a user
     */
    async delete(id: string): Promise<void> {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    },
  };