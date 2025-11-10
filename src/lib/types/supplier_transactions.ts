// ----------------------------------------------------
// supplier_transactions.ts
// Types for Supplier Transactions Management
// ----------------------------------------------------

// 1️⃣ Transaction Types — UI-only helper for better UX
// Backend only uses credit/debit, but we map these for clarity
export type SupplierTransactionType =
  | "payment"     // Money paid to supplier (credit)
  | "purchase"    // Purchase of goods/services (debit)
  | "refund"      // Money refunded from supplier (credit)
  | "adjustment"; // Manual correction (credit or debit)

// 2️⃣ Core Supplier Transaction Record (matches backend schema)
export interface SupplierTransaction {
  id: string;
  supplier_id: string;
  transaction_date: string;

  // Accounting fields (required by backend)
  credit: number;   // Money reducing liability (payments to supplier)
  debit: number;    // Money increasing liability (purchases from supplier)

  // Optional metadata
  reference_no?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 3️⃣ Create Payload (for POST requests) - matches backend schema exactly
export interface CreateSupplierTransactionPayload {
  supplier_id: string;
  transaction_date: string;
  credit: number;
  debit: number;
  reference_no?: string;
  notes?: string;
  created_by?: string; // Optional as it might be set by backend
}

// 4️⃣ Update Payload (for PATCH requests)
export interface UpdateSupplierTransactionPayload {
  supplier_id?: string;
  transaction_date?: string;
  credit?: number;
  debit?: number;
  reference_no?: string;
  notes?: string;
}

// 5️⃣ Bulk Upsert Payload (for POST /bulk_upsert)
export interface BulkUpsertTransactionItem {
  id?: string; // Optional for new rows
  supplier_id: string;
  transaction_date: string;
  credit: number;
  debit: number;
  reference_no?: string;
  notes?: string;
}

// 6️⃣ Query Params for Fetching Transactions
export interface GetSupplierTransactionsParams {
  supplier_id?: string;
  from_date?: string;
  to_date?: string;
}

// 7️⃣ Helper type for UI forms (not sent to backend)
export interface TransactionFormData {
  supplier_id: string;
  transaction_type: SupplierTransactionType;
  amount: number;
  transaction_date: string;
  reference_no: string;
  notes: string;
}