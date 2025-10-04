// lib/types/inventory_transaction.ts

export type TransactionType = "purchase" | "sale" | "return";
export type TransactionStatus = "pending" | "completed" | "cancelled" | "on_hold";

export interface InventoryTransaction {
  id: string;
  item_id: string;
  supplier_id: string | null;
  receiver_id: string | null;
  supplier_receiver: string | null;
  transaction_type: TransactionType;
  qty_in: number;
  in_cost: number;
  qty_out: number;
  out_cost: number;
  status: TransactionStatus;
  reference_no: string | null;
  notes: string | null;
  transaction_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryTransactionInput {
  item_id: string;
  supplier_id?: string;
  receiver_id?: string;
  supplier_receiver?: string;
  transaction_type: TransactionType;
  qty_in?: number;
  in_cost?: number;
  qty_out?: number;
  out_cost?: number;
  status?: TransactionStatus;
  reference_no?: string;
  notes?: string;
  transaction_date?: string;
  created_by?: string;
}

export interface UpdateInventoryTransactionInput {
  item_id?: string;
  supplier_id?: string;
  receiver_id?: string;
  supplier_receiver?: string;
  transaction_type?: TransactionType;
  qty_in?: number;
  in_cost?: number;
  qty_out?: number;
  out_cost?: number;
  status?: TransactionStatus;
  reference_no?: string;
  notes?: string;
  transaction_date?: string;
  created_by?: string;
}