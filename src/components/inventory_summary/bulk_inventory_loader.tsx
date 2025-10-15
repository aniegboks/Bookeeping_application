"use client";

import { useState } from "react";
import { inventorySummaryApi } from "@/lib/inventory_summary";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { FileText, Upload } from "lucide-react";

interface BulkInventoryLoaderProps {
  onLoad: (summaries: InventorySummary[]) => void;
}

export function BulkInventoryLoader({ onLoad }: BulkInventoryLoaderProps) {
  const [inventoryIds, setInventoryIds] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse comma-separated IDs
    const ids = inventoryIds
      .split(",")
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (ids.length === 0) {
      setError("Please enter at least one inventory ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const summaries = await inventorySummaryApi.getBulk(ids);
      onLoad(summaries);
      setInventoryIds("");
    } catch (err) {
      console.error("Error loading bulk inventories:", err);
      setError(err instanceof Error ? err.message : "Failed to load inventories");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Bulk Load Inventories</h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="inventoryIds" className="block text-sm font-medium text-gray-700 mb-2">
            Inventory IDs (comma-separated)
          </label>
          <textarea
            id="inventoryIds"
            value={inventoryIds}
            onChange={(e) => setInventoryIds(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter inventory IDs separated by commas&#10;Example: 123, 456, 789"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          {loading ? "Loading..." : "Load Inventories"}
        </button>
      </div>
    </form>
  );
}