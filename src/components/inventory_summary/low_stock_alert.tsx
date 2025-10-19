"use client";

import { useEffect, useState } from "react";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { inventorySummaryApi } from "@/lib/inventory_summary";
import { AlertTriangle, X, ChevronDown, ChevronUp, Package } from "lucide-react";

export function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<InventorySummary[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      const data = await inventorySummaryApi.getLowStock();
      setLowStockItems(data);
      setIsVisible(data.length > 0);
    } catch (err) {
      console.error("Error fetching low stock items:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isVisible || lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-red-500 overflow-hidden">
        {/* Toast Header */}
        <div
          className="bg-gradient-to-r from-red-500 to-red-600 p-4 cursor-pointer hover:from-red-600 hover:to-red-700 transition-all"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">
                  Low Stock Alert
                </h3>
                <p className="text-red-100 text-xs">
                  {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} running low
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="bg-white max-h-96 overflow-y-auto">
            <div className="p-4 space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-red-100 p-2 rounded-full">
                      <Package className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Category: {item.category_name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-bold text-red-600">
                      {item.current_stock} {item.uom_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {item.low_stock_threshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Click items to view details or restock
              </p>
            </div>
          </div>
        )}

        {/* Collapsed Preview */}
        {!isExpanded && (
          <div className="bg-red-50 px-4 py-2 border-t border-red-200">
            <p className="text-xs text-red-700 text-center">
              Click to view all low stock items
            </p>
          </div>
        )}
      </div>

      {/* Styles for animation */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}