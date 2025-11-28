// types/inventory_combined.ts
export interface CombinedInventory {
  id: string;
  name: string;
  category: string;
  brand: string;
  uom: string;
  current_stock: number;
  total_purchases: number;
  total_distributed: number;
  total_cost: number;
  cost_price: number;
  selling_price: number;
  profit: number;
  margin: number;
  supplier_names: string;
  class_count: number;
  class_names: string;
  receiver_names: string;
  is_low_stock: boolean;
}
