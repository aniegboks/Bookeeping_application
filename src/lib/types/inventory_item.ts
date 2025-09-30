// types/inventory-item.ts

export type InventoryItemFilters = {
    category_id?: string;
    sub_category_id?: string;
    brand_id?: string;
  };
  
  export type InventoryItem = {
    id: string;
    sku?: string;
    name: string;
    category_id: string;
    sub_category_id?: string;
    brand_id?: string;
    uom_id: string;
    barcode?: string;
    description?: string;
    cost_price: number;
    selling_price: number;
    profit: number;
    margin: number;
    created_at: string;
    updated_at: string;
  };
  
  export type CreateInventoryItemInput = Omit<
    InventoryItem,
    "id" | "created_at" | "updated_at" | "profit" | "margin"
  >;
  
  export type UpdateInventoryItemInput = Partial<CreateInventoryItemInput>;
  