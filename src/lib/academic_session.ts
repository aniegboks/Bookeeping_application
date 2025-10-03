// lib/academic_session.ts

export interface AcademicSession {
  id: string;
  session: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CreateAcademicSessionData {
  session: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
}

const BASE_URL = "/api/proxy/academic_session_terms";

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

export const academicSessionsApi = {
  /**
   * Get all academic sessions
   */
  async getAll(): Promise<AcademicSession[]> {
    return fetchProxy(BASE_URL);
  },

  /**
   * Get a single academic session by ID
   */
  async getById(id: string): Promise<AcademicSession> {
    const url = `${BASE_URL}/${id}`;
    return fetchProxy(url);
  },

  /**
   * Create a new academic session
   */
  async create(data: CreateAcademicSessionData): Promise<AcademicSession> {
    return fetchProxy(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing academic session
   */
  async update(
    id: string,
    data: Partial<CreateAcademicSessionData>
  ): Promise<AcademicSession> {
    const url = `${BASE_URL}/${id}`;
    return fetchProxy(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an academic session
   */
  async delete(id: string): Promise<void> {
    const url = `${BASE_URL}/${id}`;
    await fetchProxy(url, {
      method: "DELETE",
    });
  },
} as const;