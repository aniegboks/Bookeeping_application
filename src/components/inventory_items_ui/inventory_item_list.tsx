"use client";

import { useState } from "react";
import { InventoryItem } from "@/lib/types/inventory_item";
import { formatCurrency, formatDate } from "@/lib/utils/inventory_helper";
import { PenSquare, Trash2Icon } from "lucide-react";

type Props = {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  searchTerm: string;
  onSearch: (query: string) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
};

export default function InventoryItemList({
  items,
  filteredItems,
  searchTerm,
  onSearch,
  onEdit,
  onDelete,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helpers
  const computeProfit = (item: InventoryItem) => {
    const selling = Number(item.selling_price ?? 0);
    const cost = Number(item.cost_price ?? 0);
    return selling - cost;
  };

  const computeMargin = (item: InventoryItem) => {
    const selling = Number(item.selling_price ?? 0);
    if (selling === 0) return 0;
    return (computeProfit(item) / selling) * 100;
  };

  const formatMargin = (item: InventoryItem) => computeMargin(item).toFixed(2);

  return (
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
              {["SKU", "Name", "Selling Price", "Cost Price", "Estimated Profit", "Margin", "Updated At", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-[#171D26]">{item.sku}</td>
                <td className="px-6 py-4 text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-gray-700">{formatCurrency(Number(item.selling_price ?? 0))}</td>
                <td className="px-6 py-4 text-gray-700">{formatCurrency(Number(item.cost_price ?? 0))}</td>
                <td className="px-6 py-4 text-green-700 font-semibold">{formatCurrency(computeProfit(item))}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${computeProfit(item) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {formatMargin(item)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{formatDate(item.updated_at)}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => onEdit(item)} className="text-[#3D4C63] hover:text-[#495C79] p-1 rounded hover:bg-blue-50 flex items-center gap-1">
                    <PenSquare className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 flex items-center gap-1">
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add a new item.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredItems.length > itemsPerPage && (
        <div className="flex justify-end items-center gap-2 px-6 py-4">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">
            Prev
          </button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
