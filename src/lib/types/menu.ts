// lib/types/menus.ts

export interface Menu {
  id: string;
  route: string;
  caption: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMenuPayload {
  route: string;
  caption: string;
}

export interface UpdateMenuPayload {
  route?: string;
  caption?: string;
}