"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { inventorySummaryApi } from "@/lib/inventory_summary";
import { InventorySummaryStats } from "@/components/inventory_summary/stats_card";
import { InventorySummaryTable } from "@/components/inventory_summary/table";
import { BulkInventoryLoader } from "@/components/inventory_summary/bulk_inventory_loader";
import { LowStockAlert } from "@/components/inventory_summary/low_stock_alert";
import LoadingSpinner from "@/components/ui/loading_spinner";

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

      const data = await inventorySummaryApi.getLowStock();

      if (data.length === 0) {
        toast.success("All items are sufficiently stocked — no low stock alerts.");
      }

      setSummaries(data);
    } catch (err: unknown) {
      console.error("Error fetching inventory summaries:", err);

      let message = "An unknown error occurred";

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }

      if (message.toLowerCase().includes("not found")) {
        console.warn("No low-stock items found.");
        setSummaries([]);
        setError(null);
        toast.success("All items are sufficiently stocked — no low stock alerts.");
      } else {
        setError("Failed to fetch inventory summaries");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBulkLoad = (newSummaries: InventorySummary[]) => {
    setSummaries((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const uniqueNew = newSummaries.filter((s) => !existingIds.has(s.id));
      return [...prev, ...uniqueNew];
    });
  };

  if (loading) {
    return <LoadingSpinner />;
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
    <div className="my-4">
      {/* Low Stock Toast Alert */}
      <LowStockAlert />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
        </div>
      </div>

      {/* Stats */}
      <InventorySummaryStats summaries={summaries} />

      {/* Table */}
      <InventorySummaryTable summaries={summaries} />

      {/* Bulk Load Button at Bottom */}
      <div className="mt-4 flex justify-start">
        <button
          onClick={() => setShowBulkLoader(true)}
          className="px-4 py-2 text-sm font-sm bg-[#3D4C63] text-white rounded-sm hover:bg-[#2f3a4e] ransition-colors "
        >
          Bulk Load Inventories
        </button>
      </div>

      {/* Bulk Loader Modal */}
      <BulkInventoryLoader
        isOpen={showBulkLoader}
        onClose={() => setShowBulkLoader(false)}
        onLoad={handleBulkLoad}
      />
    </div>
  );
}
