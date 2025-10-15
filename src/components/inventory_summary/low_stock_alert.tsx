"use client";

import { useEffect, useState } from "react";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { inventorySummaryApi } from "@/lib/inventory_summary";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<InventorySummary[]>([]);
  const [isVisible, setIsVisible] = useState(false);
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
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Low Stock Alert
            </h3>
            <p className="text-sm text-red-700 mb-2">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} running low on stock
            </p>
            <div className="space-y-1">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="text-xs text-red-600">
                  <span className="font-medium">{item.name}</span> - {item.current_stock} {item.uom_name} remaining
                </div>
              ))}
              {lowStockItems.length > 3 && (
                <Link
                  href="/inventory-summary"
                  className="text-xs text-red-700 hover:text-red-900 font-medium inline-block mt-1"
                >
                  View all {lowStockItems.length} items →
                </Link>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}