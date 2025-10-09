// lib/types/inventory_distribution.ts

export interface InventoryDistribution {
  id: string;
  class_id: string;
  inventory_item_id: string;
  session_term_id: string;
  distributed_quantity: number;
  distribution_date: string;
  received_by: string;
  receiver_name: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryDistributionInput {
  class_id: string;
  inventory_item_id: string;
  session_term_id: string;
  distributed_quantity: number;
  distribution_date: string;
  received_by: string;
  receiver_name: string;
  notes?: string;
  created_by: string;
}

export interface UpdateInventoryDistributionInput {
  class_id?: string;
  inventory_item_id?: string;
  session_term_id?: string;
  distributed_quantity?: number;
  distribution_date?: string;
  received_by?: string;
  receiver_name?: string;
  notes?: string;
  created_by?: string;
}