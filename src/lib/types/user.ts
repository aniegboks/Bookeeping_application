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
 * User metadata structure within Supabase Auth
 */
export interface UserMetadata {
  name?: string;
  username?: string;
  roles?: string[];
  [key: string]: unknown;
}

/**
 * Auth-specific types for Supabase endpoints
 */
export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  user_metadata: UserMetadata;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface CreateAuthUserInput {
  email: string;
  password: string;
  phone: string;
  user_metadata?: UserMetadata;
}

/**
 * Response structure from POST /api/v1/auth/create-user
 */
export interface CreateAuthUserResponse {
  user?: {
    id?: string;
    email?: string;
    phone?: string;
    user_metadata?: UserMetadata;
    created_at?: string;
    last_sign_in_at?: string;
  };
  [key: string]: unknown;
}