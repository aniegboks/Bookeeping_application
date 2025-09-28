// api/academicSessions.ts

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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

// Get base URL from .env
const BASE_URL = process.env.API_BASE_URL;
if (!BASE_URL) {
  throw new Error("Environment variable API_BASE_URL is not defined in .env");
}

// Generic helper for API calls
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

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  let data: any;
  try {
    data = await response.json();
  } catch {
    const text = await response.text();
    throw new ApiError(
      `Expected JSON but received: ${text.slice(0, 200)}`,
      response.status
    );
  }

  if (!response.ok) {
    throw new ApiError(data?.message || `HTTP ${response.status}`, response.status);
  }

  return data;
};

// Academic Sessions API
const PATH = '/academic_session_terms';

export const academicSessionsApi = {
  getAll: (token?: string): Promise<AcademicSession[]> =>
    apiCall(PATH, {}, token),

  getById: (id: string, token?: string): Promise<AcademicSession> =>
    apiCall(`${PATH}/${id}`, {}, token),

  create: (data: CreateAcademicSessionData, token?: string): Promise<AcademicSession> =>
    apiCall(PATH, { method: 'POST', body: JSON.stringify(data) }, token),

  update: (
    id: string,
    data: Partial<CreateAcademicSessionData>,
    token?: string
  ): Promise<AcademicSession> =>
    apiCall(`${PATH}/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  delete: (id: string, token?: string): Promise<void> =>
    apiCall(`${PATH}/${id}`, { method: 'DELETE' }, token),
} as const;