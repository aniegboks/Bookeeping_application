// lib/supplier_transactions_api.ts

import {
  SupplierTransaction,
  CreateSupplierTransactionPayload,
  UpdateSupplierTransactionPayload,
  GetSupplierTransactionsParams,
  BulkUpsertTransactionItem,
} from "./types/supplier_transactions";

const BASE_URL = "/api/proxy/supplier_transactions";

async function fetchApi(url: string, options: RequestInit = {}) {
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
      return null;
    }

    return response.json();
  } catch (err) {
    console.error("API call failed:", err);
    throw err;
  }
}

export const supplierTransactionsApi = {
  async getAll(
    filters?: GetSupplierTransactionsParams
  ): Promise<SupplierTransaction[]> {
    const query = new URLSearchParams(
      filters as Record<string, string>
    ).toString();
    const url = `${BASE_URL}${query ? `?${query}` : ""}`;
    return fetchApi(url);
  },

  async getById(id: string): Promise<SupplierTransaction> {
    const url = `${BASE_URL}/${id}`;
    return fetchApi(url);
  },

  async create(
    data: CreateSupplierTransactionPayload
  ): Promise<SupplierTransaction> {
    return fetchApi(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(
    id: string,
    data: UpdateSupplierTransactionPayload
  ): Promise<SupplierTransaction> {
    const url = `${BASE_URL}/${id}`;
    return fetchApi(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    const url = `${BASE_URL}/${id}`;
    await fetchApi(url, {
      method: "DELETE",
    });
  },

  async bulkUpsert(data: BulkUpsertTransactionItem[]): Promise<any> {
    const url = `${BASE_URL}/bulk_upsert`;
    return fetchApi(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};