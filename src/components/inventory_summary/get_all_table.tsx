"use client";

import { useState, useMemo, useEffect } from "react";
import { Eye, ArrowUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { InventoryDetailModal } from "./inventory_detail_modal";
import { InventoryItem } from "@/lib/types/inventory_item";

interface AllInventoryTableProps {
  inventories: (InventorySummary | InventoryItem)[];
}

type SortField = keyof InventorySummary;
type SortDirection = "asc" | "desc";

export function AllInventoryTable({ inventories }: AllInventoryTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInventories, setFilteredInventories] = useState<InventorySummary[]>([]);

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 🔸 Normalize data
  const normalizedInventories: InventorySummary[] = useMemo(() => {
    return inventories.map((inv: any) => ({
      id: inv.id,
      name: inv.name ?? "Unnamed Item",
      sku: inv.sku ?? "N/A",
      category_name: inv.category_name ?? "N/A",
      brand_name: inv.brand_name ?? "N/A",
      uom_name: inv.uom_name ?? "unit",
      total_in_quantity: inv.total_in_quantity ?? 0,
      total_out_quantity: inv.total_out_quantity ?? 0,
      total_in_cost: inv.total_in_cost ?? 0,
      total_out_cost: inv.total_out_cost ?? 0,
      is_low_stock: inv.is_low_stock ?? false,
      last_transaction_date: inv.last_transaction_date ?? null,
      last_purchase_date: inv.last_purchase_date ?? null,
      last_sale_date: inv.last_sale_date ?? null,
      current_stock: inv.current_stock ?? 0,
      low_stock_threshold: inv.low_stock_threshold ?? 0,
    }));
  }, [inventories]);

  // 🔍 Filter by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredInventories(normalizedInventories);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredInventories(
        normalizedInventories.filter(
          (inv) =>
            inv.name?.toLowerCase().includes(lower) ||
            inv.sku?.toLowerCase().includes(lower) ||
            inv.category_name?.toLowerCase().includes(lower)
        )
      );
    }
    setCurrentPage(1); // reset to first page when filtering
  }, [normalizedInventories, searchTerm]);

  // 🔸 Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedInventories = useMemo(() => {
    return [...filteredInventories].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredInventories, sortField, sortDirection]);

  // 🔹 Pagination calculations
  const totalPages = Math.ceil(sortedInventories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventories = sortedInventories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-sm border border-gray-200 mb-8">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 gap-3">
        <h2 className="text-sm font-semibold text-gray-700">
          All Inventory Items ({filteredInventories.length})
        </h2>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-gray-400 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                { key: "name", label: "Item Name" },
                { key: "sku", label: "SKU" },
                { key: "category_name", label: "Category" },
              ].map(({ key, label }) => (
                <th key={key} className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort(key as SortField)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
                  >
                    {label}
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-center">View</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedInventories.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.brand_name || "N/A"}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.sku || "N/A"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.category_name || "N/A"}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedInventoryId(item.id)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}

            {paginatedInventories.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500 text-sm">
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 text-sm">
        {/* Page size selector */}
        <div className="flex items-center gap-2 text-gray-600">
          <span>Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-sm text-sm px-2 py-1 focus:ring-1 focus:ring-gray-400"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-sm border ${
              currentPage === 1
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-2 rounded-sm border ${
              currentPage === totalPages || totalPages === 0
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedInventoryId && (
        <InventoryDetailModal
          inventoryId={selectedInventoryId}
          isOpen={!!selectedInventoryId}
          onClose={() => setSelectedInventoryId(null)}
        />
      )}
    </div>
  );
}
