// global_summary.tsx
"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { CombinedInventory } from "./inventory_report_container";
import SmallLoader from "../ui/small_loader";

interface InventoryReportTableProps {
  data: CombinedInventory[];
  loading: boolean;
}

export function InventoryReportTable({
  data,
  loading,
}: InventoryReportTableProps) {
  const [filteredData, setFilteredData] = useState<CombinedInventory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const rowsPerPage = 15;

  useEffect(() => {
    applyFilters();
  }, [data, searchTerm]);

  function applyFilters() {
    let filtered = [...data];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term) ||
          item.brand.toLowerCase().includes(term) ||
          item.supplier_names.toLowerCase().includes(term) ||
          item.class_names.toLowerCase().includes(term)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }

  function toggleRowExpansion(itemId: string) {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }

  function exportSpreadsheet() {
    if (filteredData.length === 0) {
      toast.error("No data to export.");
      return;
    }

    // Prepare data for Excel
    const worksheetData = filteredData.map((r) => ({
      SKU: r.id,
      Suppliers: r.supplier_names,
      "Item Name": r.name,
      Brand: r.brand,
      Category: r.category,
      Purchases: r.total_purchases,
      Distributed: r.total_distributed,
      Stock: r.current_stock,
      "Total Cost": r.total_cost,
      "Amount Paid": r.total_amount_paid,
      "Cost Price": r.cost_price,
      "Selling Price": r.selling_price,
      Profit: r.profit,
      "Margin (%)": r.margin,
      "Classes Count": r.class_count,
      "Classes Distributed To": r.class_names,
      Receivers: r.receiver_names,
      UOM: r.uom,
      Status: r.is_low_stock ? "Low" : "OK",
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");

    // Set column widths for better readability
    const columnWidths = [
      { wch: 35 }, // SKU
      { wch: 25 }, // Suppliers
      { wch: 30 }, // Item Name
      { wch: 20 }, // Brand
      { wch: 20 }, // Category
      { wch: 12 }, // Purchases
      { wch: 12 }, // Distributed
      { wch: 10 }, // Stock
      { wch: 15 }, // Total Cost
      { wch: 15 }, // Amount Paid
      { wch: 15 }, // Cost Price
      { wch: 15 }, // Selling Price
      { wch: 15 }, // Profit
      { wch: 12 }, // Margin (%)
      { wch: 15 }, // Classes Count
      { wch: 30 }, // Classes Distributed To
      { wch: 25 }, // Receivers
      { wch: 10 }, // UOM
      { wch: 12 }, // Status
    ];
    worksheet["!cols"] = columnWidths;

    // Generate filename with timestamp
    const filename = `inventory_enhanced_report_${Date.now()}.xlsx`;

    // Write and download the file
    XLSX.writeFile(workbook, filename);

    toast.success("Excel file exported successfully!");
  }

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="p-8 bg-white rounded-sm border border-gray-200 my-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Global Inventory Report
            </h2>
            <p className="text-sm text-gray-500">
              Comprehensive overview of all inventory items
            </p>
          </div>
        </div>
        <button
          onClick={exportSpreadsheet}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3D4C63] text-white text-sm font-medium rounded-sm hover:bg-[#495C79] transition-all shadow-sm hover:shadow"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, category, brand, supplier or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-10 w-10 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>

            <p className="text-gray-600 font-medium text-sm">
              Loading inventory data...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-8 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    {/* Expand column */}
                  </th>
                  <th className="px-6 py-8 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    ITEM ID
                  </th>
                  <th className="px-6 py-8 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Suppliers
                  </th>
                  <th className="px-6 py-8 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Item Name
                  </th>
                  <th className="px-6 py-8 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Brand
                  </th>
                  <th className="px-6 py-8 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Category
                  </th>
                  <th className="px-6 py-8 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Purchases
                  </th>
                  <th className="px-6 py-8 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Distributed
                  </th>
                  <th className="px-6 py-8 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Stock
                  </th>
                  <th className="px-6 py-8 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Total Cost
                  </th>
                  <th className="px-6 py-8 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Amount Paid
                  </th>
                  <th className="px-6 py-8 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Cost Price
                  </th>
                  <th className="px-6 py-8 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Selling Price
                  </th>
                  <th className="px-6 py-8 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Profit
                  </th>
                  <th className="px-6 py-8 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Margin (%)
                  </th>
                  <th className="px-6 py-8 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Classes
                  </th>
                  <th className="px-6 py-8 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Distributed To
                  </th>
                  <th className="px-6 py-8 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Receivers
                  </th>
                  <th className="px-6 py-8 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    UOM
                  </th>
                  <th className="px-6 py-8 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item, index) => {
                  const isExpanded = expandedRows.has(item.id);
                  return (
                    <>
                      <tr
                        key={item.id}
                        className={`transition-colors duration-150 hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleRowExpansion(item.id)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {item.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.supplier_names}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.brand}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-900 text-xs">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm px-3 py-1.5 rounded-full text-gray-900">
                            {item.total_purchases}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm px-3 py-1.5 rounded-full text-gray-900">
                            {item.total_distributed}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-900">
                            {item.current_stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-gray-900">
                            ₦
                            {item.total_cost.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm  text-gray-900">
                            ₦
                            {item.total_amount_paid.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">
                          ₦
                          {item.cost_price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">
                          ₦
                          {item.selling_price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-sm ${
                              item.profit >= 0 ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            ₦
                            {item.profit.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-sm ${
                              item.margin >= 0 ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {item.margin.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-900 text-sm">
                            {item.class_count}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.class_names &&
                          item.class_names !== "No Distribution" ? (
                            <div className="flex flex-wrap gap-1">
                              {item.class_names
                                .split(",")
                                .map((cls) => cls.trim())
                                .map((cls, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
                                  >
                                    {cls}
                                  </span>
                                ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">
                              No Distribution
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.receiver_names}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-medium text-gray-900 uppercase">
                            {item.uom}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.is_low_stock ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Row Details */}
                      {isExpanded && (
                        <tr key={`${item.id}-expanded`} className="bg-gray-50">
                          <td colSpan={20} className="px-6 py-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                Complete Item Details
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Identification Section */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">
                                    Identification
                                  </h4>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Full SKU/ID
                                    </span>
                                    <span className="text-sm text-gray-900 font-mono break-all">
                                      {item.id}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Item Name
                                    </span>
                                    <span className="text-sm text-gray-900 font-semibold">
                                      {item.name}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Brand
                                    </span>
                                    <span className="text-sm text-gray-900">
                                      {item.brand}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Category
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-900 text-xs">
                                      {item.category}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Unit of Measure
                                    </span>
                                    <span className="text-sm text-gray-900 font-medium uppercase">
                                      {item.uom}
                                    </span>
                                  </div>
                                </div>

                                {/* Inventory Section */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">
                                    Inventory
                                  </h4>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Total Purchases
                                    </span>
                                    <span className="text-sm text-gray-900 font-semibold">
                                      {item.total_purchases}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Total Distributed
                                    </span>
                                    <span className="text-sm text-gray-900 font-semibold">
                                      {item.total_distributed}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Current Stock
                                    </span>
                                    <span className="text-sm text-gray-900 font-bold">
                                      {item.current_stock}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Stock Status
                                    </span>
                                    {item.is_low_stock ? (
                                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                        Low Stock
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                        In Stock
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Financial Section */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">
                                    Financial
                                  </h4>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Total Cost
                                    </span>
                                    <span className="text-sm text-gray-900 font-semibold">
                                      ₦
                                      {item.total_cost.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Amount Paid
                                    </span>
                                    <span className="text-sm text-gray-900 font-semibold">
                                      ₦
                                      {item.total_amount_paid.toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Cost Price (per unit)
                                    </span>
                                    <span className="text-sm text-gray-900">
                                      ₦
                                      {item.cost_price.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Selling Price (per unit)
                                    </span>
                                    <span className="text-sm text-gray-900">
                                      ₦
                                      {item.selling_price.toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Profit (per unit)
                                    </span>
                                    <span
                                      className={`text-sm font-bold ${
                                        item.profit >= 0
                                          ? "text-green-700"
                                          : "text-red-700"
                                      }`}
                                    >
                                      ₦
                                      {item.profit.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Margin
                                    </span>
                                    <span
                                      className={`text-sm font-bold ${
                                        item.margin >= 0
                                          ? "text-green-700"
                                          : "text-red-700"
                                      }`}
                                    >
                                      {item.margin.toFixed(2)}%
                                    </span>
                                  </div>
                                </div>

                                {/* Distribution Section */}
                                <div className="space-y-3 md:col-span-2 lg:col-span-3">
                                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">
                                    Distribution
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-xs text-gray-500 block mb-1">
                                        Suppliers
                                      </span>
                                      <span className="text-sm text-gray-900">
                                        {item.supplier_names}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 block mb-1">
                                        Receivers
                                      </span>
                                      <span className="text-sm text-gray-900">
                                        {item.receiver_names}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-2">
                                      Classes Distributed To ({item.class_count})
                                    </span>
                                    {item.class_names &&
                                    item.class_names !== "No Distribution" ? (
                                      <div className="flex flex-wrap gap-2">
                                        {item.class_names
                                          .split(",")
                                          .map((cls) => cls.trim())
                                          .map((cls, idx) => (
                                            <span
                                              key={idx}
                                              className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
                                            >
                                              {cls}
                                            </span>
                                          ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm italic">
                                        No Distribution
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 text-sm">
            <p className="text-gray-600 font-medium">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + rowsPerPage, filteredData.length)} of{" "}
              {filteredData.length} items
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}