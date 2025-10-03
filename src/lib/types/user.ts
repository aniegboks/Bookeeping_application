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