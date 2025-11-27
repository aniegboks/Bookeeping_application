"use client";

import { useState } from "react";
import {
  PenSquare,
  Trash2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";

import { InventoryItem } from "@/lib/types/inventory_item";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

interface InventoryItemListProps {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  searchTerm: string;
  onSearch: (term: string) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

// Low Stock Alert Component
function LowStockAlert({ lowStockItems }: { lowStockItems: InventoryItem[] }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || lowStockItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-red-500 overflow-hidden">
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
                <h3 className="text-white font-bold text-sm">Low Stock Alert</h3>
                <p className="text-red-100 text-xs">
                  {lowStockItems.length} item
                  {lowStockItems.length !== 1 ? "s" : ""} running low
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
                      <p className="text-xs text-gray-600">SKU: {item.sku}</p>
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
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Click items to view details or restock
              </p>
            </div>
          </div>
        )}

        {!isExpanded && (
          <div className="bg-red-50 px-4 py-2 border-t border-red-200">
            <p className="text-xs text-red-700 text-center">
              Click to view all low stock items
            </p>
          </div>
        )}
      </div>

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

// Main Inventory Table Component
export default function InventoryItemList({
  filteredItems,
  searchTerm,
  onSearch,
  onEdit,
  onDelete,
  canUpdate = true,
  canDelete = true,
}: InventoryItemListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const lowStockItems = sortedItems.filter(
    (item) => item.current_stock <= item.low_stock_threshold
  );

  const computeProfit = (item: InventoryItem) =>
    Number(item.selling_price ?? 0) - Number(item.cost_price ?? 0);

  const computeMargin = (item: InventoryItem) => {
    const selling = Number(item.selling_price ?? 0);
    if (selling === 0) return 0;
    return (computeProfit(item) / selling) * 100;
  };

  const formatMargin = (item: InventoryItem) =>
    computeMargin(item).toFixed(2);

  const isLowStock = (item: InventoryItem) =>
    item.current_stock <= item.low_stock_threshold;

  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#3D4C63] focus:outline-none"
              value={searchTerm}
              onChange={(e) => {
                onSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "SKU",
                  "Name",
                  "Selling Price",
                  "Cost Price",
                  "Estimated Profit",
                  "Margin",
                  "Current Stock",
                  "Updated At",
                  ...(hasAnyActionPermission ? ["Actions"] : []),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[#171D26]">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatCurrency(Number(item.selling_price ?? 0))}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatCurrency(Number(item.cost_price ?? 0))}
                  </td>
                  <td className="px-2 py-1">
                    <span
                      className={`inline-block px-2 py-1 text-center font-semibold rounded-full text-xs ${computeProfit(item) > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {formatCurrency(computeProfit(item))}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${computeProfit(item) > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {formatMargin(item)}%
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${isLowStock(item)
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                          }`}
                      >
                        {item.current_stock} {item.uom_name}
                      </span>
                      {isLowStock(item) && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(item.updated_at)}
                  </td>

                  {/* Only show action buttons if user has permissions */}
                  {hasAnyActionPermission && (
                    <td className="px-6 py-4 flex gap-2">
                      {/* Only show Edit button if user can update */}
                      {canUpdate && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-[#3D4C63] hover:text-[#495C79] p-1 rounded hover:bg-blue-50 flex items-center gap-1"
                          title="Edit item"
                        >
                          <PenSquare className="h-4 w-4" />
                        </button>
                      )}
                      {/* Only show Delete button if user can delete */}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 flex items-center gap-1"
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No items found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or add a new item.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {sortedItems.length > itemsPerPage && (
          <div className="flex justify-end items-center gap-2 px-6 py-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <LowStockAlert lowStockItems={lowStockItems} />
    </>
  );
}