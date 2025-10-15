"use client";

import { Package, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { InventorySummary } from "@/lib/types/inventory_summary";

interface InventorySummaryStatsProps {
  summaries: InventorySummary[];
}

export function InventorySummaryStats({ summaries }: InventorySummaryStatsProps) {
  const stats = {
    totalItems: summaries.length,
    lowStockItems: summaries.filter(s => s.is_low_stock).length,
    totalStockValue: summaries.reduce((sum, s) => {
      const avgCost = s.total_in_quantity > 0 ? s.total_in_cost / s.total_in_quantity : 0;
      return sum + (s.current_stock * avgCost);
    }, 0),
    totalInQuantity: summaries.reduce((sum, s) => sum + s.total_in_quantity, 0),
    totalOutQuantity: summaries.reduce((sum, s) => sum + s.total_out_quantity, 0),
  };

  const statCards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Stock Value",
      value: `₦${stats.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total In",
      value: stats.totalInQuantity.toLocaleString(),
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Out",
      value: stats.totalOutQuantity.toLocaleString(),
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
