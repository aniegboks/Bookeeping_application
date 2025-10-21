// types/inventory_item.ts

export type InventoryItemFilters = {
  category_id?: string;
  sub_category_id?: string;
  brand_id?: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  sub_category_id: string;
  brand_id: string;
  uom_id: string;
  barcode: string | null;
  description?: string;
  cost_price: number;
  selling_price: number;
  profit: number;
  margin: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;

  category_name: string;
  sub_category_name: string;
  brand_name: string;
  uom_name: string;
  current_stock: number;
  total_in_cost: number;
  total_out_cost: number;

  categories?: {
    id: string;
    name: string;
  };
  sub_categories?: {
    id: string;
    name: string;
  };
  uoms?: {
    id: string;
    name: string;
  };
  brands?: {
    id: string;
    name: string;
  };
};

// 👇 Add this alias
export type GlobalInventoryItem = InventoryItem;

export type CreateInventoryItemInput = Omit<
  InventoryItem,
  | "id"
  | "created_at"
  | "updated_at"
  | "profit"
  | "margin"
  | "category_name"
  | "sub_category_name"
  | "brand_name"
  | "uom_name"
  | "current_stock"
  | "total_in_cost"
  | "total_out_cost"
  | "categories"
  | "sub_categories"
  | "uoms"
  | "brands"
>;

export type UpdateInventoryItemInput = Partial<CreateInventoryItemInput>;
