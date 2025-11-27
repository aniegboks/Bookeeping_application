// lib/types/user.ts

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  username?: string;
  roles: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  phone: string;
  name: string;
  roles: string[];
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  phone?: string;
  name?: string;
  roles?: string[];
}

/**
 * Auth-specific types for Supabase endpoints
 */
export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  user_metadata: {
    name?: string;
    username?: string;
    roles?: string[];
    [key: string]: any;
  };
}

export interface CreateAuthUserInput {
  email: string;
  password: string;
  phone: string;
  user_metadata?: {
    name?: string;
    username?: string;
    roles?: string[];
    [key: string]: any;
  };
}

export interface CreateAuthUserResponse {
  id?: string;
  email?: string;
  created_at?: string;
  [key: string]: any;
}