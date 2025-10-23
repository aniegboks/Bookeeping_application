"use client";

import { useState, useMemo } from "react";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { AlertTriangle, ArrowUpDown, CheckCircle, Eye } from "lucide-react";
import { InventoryDetailModal } from "./inventory_detail_modal";

interface InventorySummaryTableProps {
  summaries: InventorySummary[];
}

type SortField = keyof InventorySummary | "avgCost";
type SortDirection = "asc" | "desc";

export function InventorySummaryTable({ summaries }: InventorySummaryTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState<"all" | "low_stock" | "adequate">("all");
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getAvgCost = (summary: InventorySummary) =>
    summary.total_in_quantity > 0
      ? summary.total_in_cost / summary.total_in_quantity
      : 0;

  const isLowStock = (summary: InventorySummary) => {
    const threshold = summary.low_stock_threshold || 0;
    return (summary.current_stock || 0) <= threshold;
  };

  // Derived data
  const { sortedSummaries, lowStockCount, adequateStockCount } = useMemo(() => {
    const filtered = summaries.filter((s) => {
      if (filter === "low_stock") return isLowStock(s);
      if (filter === "adequate") return !isLowStock(s);
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number | boolean | null;
      let bValue: string | number | boolean | null;

      if (sortField === "avgCost") {
        aValue = getAvgCost(a);
        bValue = getAvgCost(b);
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return {
      sortedSummaries: sorted,
      lowStockCount: summaries.filter(isLowStock).length,
      adequateStockCount: summaries.length - summaries.filter(isLowStock).length,
    };
  }, [summaries, filter, sortField, sortDirection]);

  const overallStatus =
    summaries.length === 0
      ? "No data available"
      : lowStockCount > 0
      ? `${lowStockCount} item${lowStockCount > 1 ? "s" : ""} low on stock`
      : "All items are adequately stocked";

  const overallStatusColor =
    summaries.length === 0
      ? "bg-gray-100 text-gray-700"
      : lowStockCount > 0
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-green-50 text-green-700 border-green-200";

  return (
    <div className="bg-white rounded-sm border border-gray-200">
      {/* Header with filter */}
      <div
        className={`p-4 border-b border-gray-200 flex items-center justify-between ${overallStatusColor}`}
      >
        <div className="flex items-center gap-2">
          {lowStockCount > 0 ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          <h2 className="text-sm font-medium">{overallStatus}</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-[#3D4C63] hover:bg-[#2f3a4e] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({summaries.length})
          </button>
          <button
            onClick={() => setFilter("low_stock")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "low_stock"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Low ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter("adequate")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "adequate"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Adequate ({adequateStockCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[{ key: "name", label: "Item Name" }, { key: "sku", label: "SKU" }, { key: "category_name", label: "Category" }].map(
                ({ key, label }) => (
                  <th key={key} className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort(key as SortField)}
                      className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
                    >
                      {label}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                )
              )}
              <th className="px-4 py-3 text-right">Current Stock</th>
              <th className="px-4 py-3 text-right">Min Level</th>
              <th className="px-4 py-3 text-right">Total In</th>
              <th className="px-4 py-3 text-right">Total Out</th>
              <th className="px-4 py-3 text-right">Avg Cost</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">View</th> {/* Eye icon column */}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {sortedSummaries.map((summary) => {
              const avgCost = getAvgCost(summary);
              const lowStock = isLowStock(summary);
              const threshold = summary.low_stock_threshold || 0;
              const stockPercentage =
                threshold > 0 ? ((summary.current_stock || 0) / threshold) * 100 : 100;

              return (
                <tr key={summary.id} className={`hover:bg-gray-50 ${lowStock ? "bg-red-50/30" : ""}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{summary.name}</p>
                      <p className="text-xs text-gray-500">{summary.brand_name || "N/A"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{summary.sku || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{summary.category_name || "N/A"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${lowStock ? "text-red-600" : "text-gray-900"}`}>
                      {summary.current_stock || 0} {summary.uom_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">{threshold}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{summary.total_in_quantity || 0}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{summary.total_out_quantity || 0}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    ₦{avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {lowStock ? (
                      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-100 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold text-red-700">Low Stock</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">Adequate</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedInventoryId(summary.id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedSummaries.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">No inventory items found.</div>
        )}
      </div>

      {/* Modal */}
      {selectedInventoryId && (
        <InventoryDetailModal
          inventoryId={selectedInventoryId}
          isOpen={!!selectedInventoryId}
          onClose={() => setSelectedInventoryId(null)}
        />
      )}

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Showing {sortedSummaries.length} of {summaries.length} items
          {filter !== "all" &&
            ` • Filtered by: ${filter === "low_stock" ? "Low Stock" : "Adequate Stock"}`}
        </p>
      </div>
    </div>
  );
}
