export interface Category {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}
