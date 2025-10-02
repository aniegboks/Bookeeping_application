// src\lib\academic_session.ts

// --- Custom Error Class ---
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
      super(message);
      this.status = status;
      this.name = 'ApiError';
      // Ensure instanceof works correctly
      if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, ApiError.prototype);
      } else {
          (this as any).__proto__ = ApiError.prototype;
      }
  }
}

// --- Interfaces ---
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

interface ApiErrorResponse {
  message?: string;
}

// --- Setup ---
const BASE_URL = process.env.API_BASE_URL;
if (!BASE_URL) {
  throw new Error("Environment variable API_BASE_URL is not defined in .env");
}

// --- Generic API Caller Function (Final and Corrected) ---
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> => {
  const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
  };

  if (token) {
      headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 1. FIX: Ensure the body is stringified for POST/PUT requests
  let requestBody: BodyInit | null | undefined;
  if (options.body && typeof options.body !== 'string') {
      requestBody = JSON.stringify(options.body);
  } else {
      requestBody = options.body;
  }

  const finalOptions: RequestInit = {
      ...options, 
      headers,
      body: requestBody
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, finalOptions);

  // 2. FIX: Handle 204 No Content (prevents original 500 crash on DELETE)
  if (response.status === 204) {
      return null as T; 
  }

  // 3. FIX: Read body ONCE as text to prevent "body stream already read" error
  const responseText = await response.text();

  let data: T | ApiErrorResponse;
  try {
      // Attempt to parse the single text read as JSON
      data = JSON.parse(responseText || '{}') as T | ApiErrorResponse;
  } catch {
      // The body wasn't JSON (e.g., HTML error page). Use the raw text for the error.
      throw new ApiError(
          `Expected JSON but received: ${responseText.slice(0, 200)}`,
          response.status
      );
  }

  // Check for HTTP error statuses (4xx or 5xx)
  if (!response.ok) {
      throw new ApiError(
          (data as ApiErrorResponse)?.message || `HTTP ${response.status}`,
          response.status
      );
  }

  return data as T;
};

const PATH = '/academic_session_terms';


export const academicSessionsApi = {
  getAll: (token?: string): Promise<AcademicSession[]> =>
      apiCall(PATH, { method: 'GET' }, token),

  getById: (id: string, token?: string): Promise<AcademicSession> =>
      apiCall(`${PATH}/${id}`, { method: 'GET' }, token),

  create: (data: CreateAcademicSessionData, token?: string): Promise<AcademicSession> =>
      apiCall(PATH, { method: 'POST', body: data as unknown as BodyInit }, token),

  update: (
      id: string,
      data: Partial<CreateAcademicSessionData>,
      token?: string
  ): Promise<AcademicSession> =>
      apiCall(`${PATH}/${id}`, { method: 'PUT', body: data as unknown as BodyInit }, token),

  delete: (id: string, token?: string): Promise<void> =>
      apiCall(`${PATH}/${id}`, { method: 'DELETE' }, token),
} as const;