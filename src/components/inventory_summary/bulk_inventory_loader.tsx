"use client";

import { useState, useEffect } from "react";
import { inventorySummaryApi } from "@/lib/inventory_summary";
import { inventoryItemApi } from "@/lib/inventory_item";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { InventoryItem } from "@/lib/types/inventory_item";
import { FileText, Upload, X } from "lucide-react";
import SmallLoader from "../ui/small_loader";

interface BulkInventoryLoaderProps {
  onLoad: (summaries: InventorySummary[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function BulkInventoryLoader({
  onLoad,
  isOpen,
  onClose,
}: BulkInventoryLoaderProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  const fetchItems = async () => {
    try {
      setFetchingItems(true);
      const data = await inventoryItemApi.getAll();
      setItems(data);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      setError("Failed to fetch inventory items");
    } finally {
      setFetchingItems(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setError("Please select at least one item");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const summaries = await inventorySummaryApi.getBulk(selectedIds);
      onLoad(summaries);
      setSelectedIds([]);
      onClose();
    } catch (err) {
      console.error("Error loading bulk inventories:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load inventories"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Bulk Load Inventories
            </h3>
            <p className="text-sm text-gray-500">
              Select inventory items to load their summaries
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {fetchingItems ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#495C79]-600"></div>
              <p className="ml-3 text-gray-500 text-sm">Loading items...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Inventory Items
                  </label>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-sm text-[#495C79] hover:text-[#3D4C63] font-medium"
                  >
                    {selectedIds.length === items.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 text-sm">
                        No inventory items found
                      </p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          {item.sku && (
                            <p className="text-xs text-gray-500">
                              SKU: {item.sku}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {selectedIds.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    {selectedIds.length} item
                    {selectedIds.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || selectedIds.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#495C79] rounded-sm hover:bg-[#3f5069] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Loading…</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {`Load ${selectedIds.length} Item${
                    selectedIds.length !== 1 ? "s" : ""
                  }`}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
