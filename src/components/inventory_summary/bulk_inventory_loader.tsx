"use client";

import { useState, useEffect } from "react";
import { inventorySummaryApi } from "@/lib/inventory_summary";
import { inventoryItemApi } from "@/lib/inventory_item"; // <-- fetch item list
import { InventorySummary } from "@/lib/types/inventory_summary";
import { InventoryItem } from "@/lib/types/inventory_item";
import { FileText, Upload } from "lucide-react";

interface BulkInventoryLoaderProps {
  onLoad: (summaries: InventorySummary[]) => void;
}

export function BulkInventoryLoader({ onLoad }: BulkInventoryLoaderProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load all inventory items for dropdown
    async function fetchItems() {
      try {
        const data = await inventoryItemApi.getAll();
        setItems(data);
      } catch (err) {
        console.error("Error fetching inventory items:", err);
        setError("Failed to fetch inventory items");
      } finally {
        setFetchingItems(false);
      }
    }

    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedNames.length === 0) {
      setError("Please select at least one item");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Match selected names to their IDs
      const selectedIds = items
        .filter((item) => selectedNames.includes(item.name))
        .map((item) => item.id);

      const summaries = await inventorySummaryApi.getBulk(selectedIds);
      onLoad(summaries);
      setSelectedNames([]);
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

      {fetchingItems ? (
        <p className="text-gray-500 text-sm">Loading items...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="inventoryNames" className="block text-sm font-medium text-gray-700 mb-2">
              Select Inventory Items
            </label>
            <select
              id="inventoryNames"
              multiple
              value={selectedNames}
              onChange={(e) =>
                setSelectedNames(Array.from(e.target.selectedOptions, (opt) => opt.value))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {items.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold <kbd>Ctrl</kbd> (Windows) or <kbd>Cmd</kbd> (Mac) to select multiple.
            </p>
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
      )}
    </form>
  );
}
