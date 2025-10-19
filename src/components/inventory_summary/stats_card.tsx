"use client";

import {
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import { InventorySummary } from "@/lib/types/inventory_summary";

interface InventorySummaryStatsProps {
  summaries: InventorySummary[];
}

export function InventorySummaryStats({ summaries }: InventorySummaryStatsProps) {
  const stats = {
    totalItems: summaries.length,
    lowStockItems: summaries.filter((s) => {
      const threshold = s.low_stock_threshold || 0;
      return (s.current_stock || 0) <= threshold;
    }).length,
    adequateStockItems: summaries.filter((s) => {
      const threshold = s.low_stock_threshold || 0;
      return (s.current_stock || 0) > threshold;
    }).length,
    totalStockValue: summaries.reduce((sum, s) => {
      const avgCost =
        s.total_in_quantity > 0 ? s.total_in_cost / s.total_in_quantity : 0;
      return sum + (s.current_stock || 0) * avgCost;
    }, 0),
    totalInQuantity: summaries.reduce(
      (sum, s) => sum + (s.total_in_quantity || 0),
      0
    ),
    totalOutQuantity: summaries.reduce(
      (sum, s) => sum + (s.total_out_quantity || 0),
      0
    ),
    totalInCost: summaries.reduce((sum, s) => sum + (s.total_in_cost || 0), 0),
    totalOutCost: summaries.reduce(
      (sum, s) => sum + (s.total_out_cost || 0),
      0
    ),
  };

  const lowStockPercentage =
    stats.totalItems > 0 ? (stats.lowStockItems / stats.totalItems) * 100 : 0;

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Items */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">Total Items</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalItems.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {stats.adequateStockItems} adequate • {stats.lowStockItems} low
          </p>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">Low Stock</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.lowStockItems.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {lowStockPercentage.toFixed(1)}% of total
          </p>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-50">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">Stock Value</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-1">
            ₦{stats.totalStockValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500">Current inventory value</p>
        </div>

        {/* Total In */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">Total In</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalInQuantity.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            ₦{(stats.totalInCost || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Total Out */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-orange-50">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">Total Out</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalOutQuantity.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            ₦{(stats.totalOutCost || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}