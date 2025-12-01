// global_summary.tsx
"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { CombinedInventory } from "./inventory_report_container";

interface InventoryReportTableProps {
  data: CombinedInventory[];
  loading: boolean;
}

export function InventoryReportTable({ data, loading }: InventoryReportTableProps) {
  const [filteredData, setFilteredData] = useState<CombinedInventory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
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

  function exportSpreadsheet() {
    if (filteredData.length === 0) {
      toast.error("No data to export.");
      return;
    }

    // Prepare data for Excel
    const worksheetData = filteredData.map((r) => ({
      "SKU": r.id,
      "Suppliers": r.supplier_names,
      "Item Name": r.name,
      "Brand": r.brand,
      "Category": r.category,
      "Purchases": r.total_purchases,
      "Distributed": r.total_distributed,
      "Stock": r.current_stock,
      "Total Cost": r.total_cost,
      "Amount Paid": r.total_amount_paid,
      "Cost Price": r.cost_price,
      "Selling Price": r.selling_price,
      "Profit": r.profit,
      "Margin (%)": r.margin,
      "Classes Count": r.class_count,
      "Classes Distributed To": r.class_names,
      "Receivers": r.receiver_names,
      "UOM": r.uom,
      "Status": r.is_low_stock ? "Low" : "OK",
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#3D4C63] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading inventory data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-white">
                <tr>
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
                {currentData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`transition-colors duration-150 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-white"
                      }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {item.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.supplier_names}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.brand}</td>
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
                      <span className="text-sm text-gray-900">{item.current_stock}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-900">
                        ₦{item.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm  text-gray-900">
                        ₦{item.total_amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      ₦{item.cost_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      ₦{item.selling_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm ${item.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ₦{item.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm ${item.margin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {item.margin.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-900 text-sm">
                        {item.class_count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.class_names && item.class_names !== "No Distribution" ? (
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
                        <span className="text-gray-400 text-xs italic">No Distribution</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.receiver_names}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-medium text-gray-900 uppercase">{item.uom}</span>
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
                ))}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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