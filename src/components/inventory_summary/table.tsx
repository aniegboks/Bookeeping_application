"use client";

import { useState } from "react";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { AlertTriangle, ArrowUpDown } from "lucide-react";

interface InventorySummaryTableProps {
  summaries: InventorySummary[];
}

type SortField = keyof InventorySummary | "avgCost";
type SortDirection = "asc" | "desc";

export function InventorySummaryTable({ summaries }: InventorySummaryTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState<"all" | "low_stock">("all");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getAvgCost = (summary: InventorySummary) => {
    return summary.total_in_quantity > 0
      ? summary.total_in_cost / summary.total_in_quantity
      : 0;
  };

  const sortedSummaries = [...summaries]
    .filter(s => filter === "all" || (filter === "low_stock" && s.is_low_stock))
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "avgCost") {
        aValue = getAvgCost(a);
        bValue = getAvgCost(b);
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (aValue === null) aValue = "";
      if (bValue === null) bValue = "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Inventory Summary
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilter("low_stock")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "low_stock"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Low Stock
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
                >
                  Item Name
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("sku")}
                  className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
                >
                  SKU
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("category_name")}
                  className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
                >
                  Category
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("current_stock")}
                  className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 ml-auto"
                >
                  Current Stock
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("total_in_quantity")}
                  className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 ml-auto"
                >
                  Total In
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("total_out_quantity")}
                  className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 ml-auto"
                >
                  Total Out
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("avgCost")}
                  className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 ml-auto"
                >
                  Avg Cost
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-gray-700">Status</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSummaries.map((summary) => {
              const avgCost = getAvgCost(summary);
              const stockValue = summary.current_stock * avgCost;

              return (
                <tr key={summary.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {summary.name}
                      </p>
                      <p className="text-xs text-gray-500">{summary.brand_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {summary.sku}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {summary.category_name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${
                      summary.is_low_stock ? "text-red-600" : "text-gray-900"
                    }`}>
                      {summary.current_stock} {summary.uom_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {summary.total_in_quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {summary.total_out_quantity}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ₦{avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">
                        Value: ₦{stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {summary.is_low_stock && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-medium">Low Stock</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {sortedSummaries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No inventory items found</p>
          </div>
        )}
      </div>
    </div>
  );
}