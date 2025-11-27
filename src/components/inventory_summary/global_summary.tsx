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
import { inventoryItemApi } from "@/lib/inventory_item";
import { inventoryDistributionApi } from "@/lib/inventory_distrbution";
import { inventoryTransactionApi } from "@/lib/inventory_transactions";
import { schoolClassApi } from "@/lib/classes";

interface Supplier {
  name: string;
}

interface TransactionWithSupplier {
  item_id: string;
  transaction_type: string;
  qty_in: number;
  in_cost: number;
  suppliers?: Supplier | null;
}

interface Distribution {
  inventory_item_id: string;
  distributed_quantity: number;
  class_id?: string | null;
  receiver_name?: string | null;
}

interface DistributionResponse {
  data: Distribution[];
}

interface SchoolClass {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category_name: string;
  brand_name: string;
  uom_name: string;
  current_stock: number;
  cost_price: number;
  selling_price: number;
  is_low_stock?: boolean;
}

interface CombinedInventory {
  id: string;
  name: string;
  category: string;
  brand: string;
  uom: string;
  current_stock: number;
  total_purchases: number;
  total_distributed: number;
  total_cost: number;
  cost_price: number;
  selling_price: number;
  profit: number;
  margin: number;
  supplier_names: string;
  class_count: number;
  class_names: string;
  receiver_names: string;
  is_low_stock: boolean;
}

interface DistributionTotal {
  qty: number;
  classIds: Set<string>;
  receivers: Set<string>;
}

export function GlobalInventoryEnhancedReport() {
  const [data, setData] = useState<CombinedInventory[]>([]);
  const [filteredData, setFilteredData] = useState<CombinedInventory[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Search
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchReportData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, searchTerm]);

  async function fetchReportData() {
    try {
      setLoading(true);

      const [items, transactions, distributions, classes] = await Promise.all([
        inventoryItemApi.getAll(),
        inventoryTransactionApi.getAll(),
        inventoryDistributionApi.getAll(),
        schoolClassApi.getAll(),
      ]);

      const classMap = new Map<string, string>(
        (classes as SchoolClass[]).map((cls) => [cls.id, cls.name])
      );

      const transactionTotals: Record<string, number> = {};
      const transactionCosts: Record<string, number> = {};
      const transactionSuppliers: Record<string, Set<string>> = {};
      const distributionTotals: Record<string, DistributionTotal> = {};

      for (const tx of transactions as TransactionWithSupplier[]) {
        if (tx.transaction_type === "purchase") {
          const invId = tx.item_id;
          if (!transactionTotals[invId]) transactionTotals[invId] = 0;
          if (!transactionCosts[invId]) transactionCosts[invId] = 0;
          if (!transactionSuppliers[invId]) transactionSuppliers[invId] = new Set();

          transactionTotals[invId] += tx.qty_in ?? 0;
          transactionCosts[invId] += tx.in_cost ?? 0;

          if (tx.suppliers?.name) {
            transactionSuppliers[invId].add(tx.suppliers.name);
          }
        }
      }

      const distributionsData = distributions as DistributionResponse;
      for (const dist of distributionsData.data) {
        const invId = dist.inventory_item_id;
        if (!distributionTotals[invId]) {
          distributionTotals[invId] = {
            qty: 0,
            classIds: new Set(),
            receivers: new Set(),
          };
        }

        distributionTotals[invId].qty += dist.distributed_quantity ?? 0;

        if (dist.class_id) distributionTotals[invId].classIds.add(dist.class_id);
        if (dist.receiver_name)
          distributionTotals[invId].receivers.add(dist.receiver_name);
      }

      const combined = (items as InventoryItem[]).map((item) => {
        const tIn = transactionTotals[item.id] ?? 0;
        const tCost = transactionCosts[item.id] ?? 0;
        const suppliers = Array.from(transactionSuppliers[item.id] ?? []);
        const dOut = distributionTotals[item.id]?.qty ?? 0;
        const classIds = Array.from(distributionTotals[item.id]?.classIds ?? []);
        const classNames = classIds
          .map((id) => classMap.get(id))
          .filter((name): name is string => Boolean(name));
        const receivers = Array.from(distributionTotals[item.id]?.receivers ?? []);

        const costPrice = item.cost_price ?? 0;
        const sellingPrice = item.selling_price ?? 0;
        const profit = sellingPrice - costPrice;
        const margin = costPrice > 0 ? ((profit / sellingPrice) * 100) : 0;

        return {
          id: item.id,
          name: item.name,
          category: item.category_name,
          brand: item.brand_name,
          uom: item.uom_name,
          current_stock: item.current_stock ?? 0,
          total_purchases: tIn,
          total_distributed: dOut,
          total_cost: tCost,
          cost_price: costPrice,
          selling_price: sellingPrice,
          profit: profit,
          margin: margin,
          supplier_names: suppliers.length > 0 ? suppliers.join(", ") : "N/A",
          class_count: classNames.length,
          class_names:
            classNames.length > 0 ? classNames.join(", ") : "No Distribution",
          receiver_names: receivers.length > 0 ? receivers.join(", ") : "N/A",
          is_low_stock: item.is_low_stock ?? false,
        };
      });

      setData(combined);
      setFilteredData(combined);
    } catch (err) {
      console.error("Error fetching enhanced report:", err);
      toast.error("Failed to load enhanced inventory report");
    } finally {
      setLoading(false);
    }
  }

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

    const headers = [
      "SKU",
      "Suppliers",
      "Item Name",
      "Brand",
      "Category",
      "Purchases",
      "Distributed",
      "Stock",
      "Total Cost",
      "Cost Price",
      "Selling Price",
      "Profit",
      "Margin (%)",
      "Classes Count",
      "Classes Distributed To",
      "Receivers",
      "UOM",
      "Status",
    ];

    const rows = filteredData.map((r) => [
      r.id,
      r.supplier_names,
      r.name,
      r.brand,
      r.category,
      r.total_purchases,
      r.total_distributed,
      r.current_stock,
      r.total_cost.toFixed(2),
      r.cost_price.toFixed(2),
      r.selling_price.toFixed(2),
      r.profit.toFixed(2),
      r.margin.toFixed(2),
      r.class_count,
      r.class_names,
      r.receiver_names,
      r.uom,
      r.is_low_stock ? "Low" : "OK",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_enhanced_report_${Date.now()}.csv`;
    link.click();
  }

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="p-8 bg-white rounded-sm border border-gray-100 my-8">
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
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3D4C63]  text-white text-sm font-medium rounded-sm hover:bg-[#495C79] transition-all shadow-sm hover:shadow"
        >
          <Download className="w-4 h-4" />
          Export CSV
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
            <div className="w-12 h-12 border-4 border-[#3D4C63]  border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading inventory data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    ITEM ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Suppliers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Item Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Purchases
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Distributed
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Total Cost
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Cost Price
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Selling Price
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Profit
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Margin (%)
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Classes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Distributed To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Receivers
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    UOM
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    AmountPaid
                  </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                    Discount 
                  </th>
                

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {item.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.supplier_names}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.brand}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold bg-blue-50 px-3 py-1.5 rounded-full text-blue-700">
                        {item.total_purchases}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold bg-purple-50 px-3 py-1.5 rounded-full text-purple-700">
                        {item.total_distributed}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {item.current_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900">
                        ₦{item.total_cost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      ₦{item.cost_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      ₦{item.selling_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₦{item.profit.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${item.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.margin.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                        {item.class_count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.class_names !== "No Distribution" ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          {item.class_names}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          {item.class_names}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.receiver_names}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-medium text-gray-600 uppercase">
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