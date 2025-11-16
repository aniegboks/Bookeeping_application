// types/role-menus.ts

export interface Menu {
  id: string;
  route: string;
  caption: string;
  created_at: string;
  updated_at: string;
}

export interface RoleMenu {
  id: string;
  role_code: string;
  menu_id: string;
  role?: {
    code: string;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    privileges?: Array<{
      id: string;
      role_code: string;
      description: string;
      status: string;
      created_at: string;
      updated_at: string;
    }>;
  };
  menu?: Menu;
}

export interface CreateRoleMenuPayload {
  role_code: string;
  menu_id: string;
}

export interface UpdateRoleMenuPayload {
  role_code?: string;
  menu_id?: string;
}

export interface BulkRoleMenuPayload {
  role_code: string;
  menu_ids: string[];
}