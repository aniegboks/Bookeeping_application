
export type TransactionType = "purchase" | "sale";

export interface InventorySummary {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  total_in_quantity: number;
  total_out_quantity: number;
  total_in_cost: number;
  total_out_cost: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  category_name: string;
  brand_name: string;
  uom_name: string;
  last_transaction_date: string | null;
  last_purchase_date: string | null;
  last_sale_date: string | null;
}

export interface TransactionSummary {
  transaction_type: TransactionType;
  total_quantity: number;
  total_cost: number;
  transaction_count: number;
  last_transaction_date: string | null;
}

export interface DistributionSummary {
  inventory_item_id: string;
  total_received_quantity?: number; // Note: API shows both naming conventions
  total_distributed_quantity?: number;
  total_received?: number;
  total_distributed?: number;
  balance_quantity: number;
  inventory_items: {
    id: string;
    name: string;
    sku: string;
    categories: {
      id: string;
      name: string;
    };
  };
  item_name?: string;
  last_distribution_date: string;
}