// lib/supplier_transactions_api.ts
import {
  SupplierTransaction,
  CreateSupplierTransactionPayload,
  UpdateSupplierTransactionPayload,
  GetSupplierTransactionsParams,
  BulkUpsertTransactionItem,
} from "./types/supplier_transactions";

const BASE_URL = "/api/proxy/supplier_transactions";

// Generic fetch helper with typed response
async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 401) {
        throw new Error("Authentication failed");
      }

      throw new Error(errorData?.message || response.statusText);
    }

    if (response.status === 204 || options.method === "DELETE") {
      // @ts-expect-error no content to return
      return null;
    }

    return response.json();
  } catch (err) {
    console.error("API call failed:", err);
    throw err;
  }
}

export const supplierTransactionsApi = {
  // Fetch all transactions with optional filters
  async getAll(
    filters?: GetSupplierTransactionsParams
  ): Promise<SupplierTransaction[]> {
    const query = new URLSearchParams(
      filters as Record<string, string>
    ).toString();
    const url = `${BASE_URL}${query ? `?${query}` : ""}`;
    return fetchApi<SupplierTransaction[]>(url);
  },

  // Fetch single transaction by ID
  async getById(id: string): Promise<SupplierTransaction> {
    const url = `${BASE_URL}/${id}`;
    return fetchApi<SupplierTransaction>(url);
  },

  // Create a new transaction
  async create(
    data: CreateSupplierTransactionPayload
  ): Promise<SupplierTransaction> {
    return fetchApi<SupplierTransaction>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update existing transaction
  async update(
    id: string,
    data: UpdateSupplierTransactionPayload
  ): Promise<SupplierTransaction> {
    const url = `${BASE_URL}/${id}`;
    return fetchApi<SupplierTransaction>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete a transaction
  async delete(id: string): Promise<void> {
    const url = `${BASE_URL}/${id}`;
    await fetchApi<null>(url, { method: "DELETE" });
  },

  // Bulk upsert transactions
  async bulkUpsert(
    data: BulkUpsertTransactionItem[]
  ): Promise<SupplierTransaction[]> {
    const url = `${BASE_URL}/bulk_upsert`;
    return fetchApi<SupplierTransaction[]>(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
