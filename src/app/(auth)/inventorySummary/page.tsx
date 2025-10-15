"use client";

import { useEffect, useState } from "react";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { inventorySummaryApi } from "@/lib/inventory_summary";
import { InventorySummaryStats } from "@/components/inventory_summary/stats_card";
import { InventorySummaryTable } from "@/components/inventory_summary/summary_table";
import { BulkInventoryLoader } from "@/components/inventory_summary/bulk_inventory_loader";
import { LowStockAlert } from "@/components/inventory_summary/low_stock_alert";
import { Package, RefreshCw } from "lucide-react";

export default function InventorySummaryPage() {
  const [summaries, setSummaries] = useState<InventorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBulkLoader, setShowBulkLoader] = useState(false);

  useEffect(() => {
    fetchInventorySummaries();
  }, []);

  const fetchInventorySummaries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch low-stock inventory items
      const data = await inventorySummaryApi.getLowStock();
      setSummaries(data);
    } catch (err: any) {
      console.error("Error fetching inventory summaries:", err);

      const message = err instanceof Error ? err.message : String(err);

      // Gracefully handle 404s (no low-stock data)
      if (message.toLowerCase().includes("not found")) {
        console.warn("No low-stock items found.");
        setSummaries([]);
        setError(null);
      } else {
        setError("Failed to fetch inventory summaries");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBulkLoad = (newSummaries: InventorySummary[]) => {
    // Merge new summaries with existing ones, avoiding duplicates
    setSummaries((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const uniqueNew = newSummaries.filter((s) => !existingIds.has(s.id));
      return [...prev, ...uniqueNew];
    });
    setShowBulkLoader(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchInventorySummaries}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Inventory Summary</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkLoader(!showBulkLoader)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {showBulkLoader ? "Hide" : "Bulk Load"}
            </button>
            <button
              onClick={fetchInventorySummaries}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Overview of your inventory items, stock levels, and transaction history
        </p>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />

      {/* No low-stock data message */}
      {!loading && summaries.length === 0 && (
        <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
          </p>
        </div>
      )}

      {/* Bulk Loader */}
      {showBulkLoader && (
        <div className="mb-6">
          <BulkInventoryLoader onLoad={handleBulkLoad} />
        </div>
      )}

      {/* Stats */}
      <InventorySummaryStats summaries={summaries} />

      {/* Table */}
      <InventorySummaryTable summaries={summaries} />
    </div>
  );
}
