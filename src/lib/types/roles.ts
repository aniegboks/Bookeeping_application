// lib/types/roles.ts

export interface Role {
  code: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRolePayload {
  code: string;
  name: string;
  status: string;
}

export interface UpdateRolePayload {
  name?: string;
  status?: string;
}

export type RoleStatus = "active" | "inactive";