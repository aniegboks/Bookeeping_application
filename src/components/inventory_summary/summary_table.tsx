"use client";

import { useEffect, useState, useCallback } from "react";
import { X, TrendingUp, TrendingDown, Package, Calendar, Download, FileText } from "lucide-react";

// Types
export type TransactionType = "purchase" | "sale";

// Mock API - Replace with your actual API import
const inventorySummaryApi = {
  async getById(inventoryId: string) {
    // Replace with: import { inventorySummaryApi } from "@/lib/inventory_summary";
    const response = await fetch(`/api/proxy/inventory_summary/${inventoryId}`);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    return response.json();
  },
  async getTransactionSummary(inventoryId: string, type: TransactionType) {
    const response = await fetch(`/api/proxy/inventory_summary/${inventoryId}/transactions/${type}`);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    return response.json();
  },
  async getDistributionCollection(params: { inventory_item_id: string }) {
    const queryParams = new URLSearchParams();
    if (params.inventory_item_id) queryParams.append("inventory_item_id", params.inventory_item_id);
    const response = await fetch(`/api/proxy/inventory_summary/distribution-collection/query?${queryParams}`);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    return response.json();
  },
};

export interface InventorySummary {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  total_in_quantity: number;
  total_out_quantity: number;
  total_in_cost: number;
  total_out_cost: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  category_name: string;
  brand_name: string;
  uom_name: string;
  last_transaction_date: string | null;
  last_purchase_date: string | null;
  last_sale_date: string | null;
}

export interface TransactionSummary {
  transaction_type: TransactionType;
  total_quantity: number;
  total_cost: number;
  transaction_count: number;
  last_transaction_date: string | null;
}

export interface DistributionSummary {
  inventory_item_id: string;
  total_received_quantity?: number;
  total_distributed_quantity?: number;
  total_received?: number;
  total_distributed?: number;
  balance_quantity: number;
  inventory_items: {
    id: string;
    name: string;
    sku: string;
    categories: {
      id: string;
      name: string;
    };
  };
  item_name?: string;
  last_distribution_date: string;
}

interface InventoryDetailModalProps {
  inventoryId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryDetailModal({
  inventoryId,
  isOpen,
  onClose,
}: InventoryDetailModalProps) {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [purchaseSummary, setPurchaseSummary] = useState<TransactionSummary | null>(null);
  const [distributionSummary, setDistributionSummary] = useState<DistributionSummary[]>([]);
  const [activeTab, setActiveTab] = useState<"purchase" | "distribution">("purchase");
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch summary first
      const summaryData = await inventorySummaryApi.getById(inventoryId);
      setSummary(summaryData);

      // Fetch transactions, but handle 404 gracefully
      try {
        const purchaseData = await inventorySummaryApi.getTransactionSummary(inventoryId, "purchase");
        setPurchaseSummary(purchaseData);
      } catch (err) {
        const error = err as Error;
        if (error?.message?.includes("404") || error?.message?.includes("not found")) {
          console.log("No purchase transactions found");
          setPurchaseSummary(null);
        } else {
          throw err;
        }
      }

      const distributionData = await inventorySummaryApi.getDistributionCollection({
        inventory_item_id: inventoryId,
      });
      setDistributionSummary(distributionData);
    } catch (err) {
      console.error("Error fetching inventory details:", err);
    } finally {
      setLoading(false);
    }
  }, [inventoryId]);

  useEffect(() => {
    if (isOpen && inventoryId) {
      fetchDetails();
    }
  }, [isOpen, inventoryId, fetchDetails]);

  const exportToPDF = () => {
    if (!summary) return;
    window.print();
  };

  const exportToSpreadsheet = () => {
    if (!summary) return;

    const avgCost = summary.total_in_quantity > 0
      ? summary.total_in_cost / summary.total_in_quantity
      : 0;
    const stockValue = summary.current_stock * avgCost;

    const csvData = [
      ["Inventory Details Report"],
      [""],
      ["Basic Information"],
      ["Item Name", summary.name],
      ["SKU", summary.sku],
      ["Category", summary.category_name],
      ["Brand", summary.brand_name],
      ["Unit of Measure", summary.uom_name],
      ["Status", summary.is_low_stock ? "Low Stock" : "In Stock"],
      [""],
      ["Stock Information"],
      ["Current Stock", `${summary.current_stock} ${summary.uom_name}`],
      ["Low Stock Threshold", summary.low_stock_threshold],
      ["Total In Quantity", summary.total_in_quantity],
      ["Total In Cost", `₦${summary.total_in_cost.toFixed(2)}`],
      ["Total Out Quantity", summary.total_out_quantity],
      ["Total Out Cost", `₦${summary.total_out_cost.toFixed(2)}`],
      ["Average Cost", `₦${avgCost.toFixed(2)}`],
      ["Stock Value", `₦${stockValue.toFixed(2)}`],
      [""],
      ["Purchase Summary"],
      ["Total Quantity", purchaseSummary?.total_quantity || 0],
      ["Total Cost", `₦${(purchaseSummary?.total_cost || 0).toFixed(2)}`],
      ["Transaction Count", purchaseSummary?.transaction_count || 0],
      ["Last Purchase", purchaseSummary?.last_transaction_date ? new Date(purchaseSummary.last_transaction_date).toLocaleDateString() : "N/A"],
      [""],
      ["Distribution Summary"],
      ["Item Name", "Category", "Received Qty", "Distributed Qty", "Balance", "Last Distributed"],
    ];

    distributionSummary.forEach((dist) => {
      csvData.push([
        dist.item_name || dist.inventory_items?.name || "—",
        dist.inventory_items?.categories?.name || "—",
        String(dist.total_received_quantity ?? 0),
        String(dist.total_distributed_quantity ?? 0),
        String(dist.balance_quantity ?? 0),
        dist.last_distribution_date ? new Date(dist.last_distribution_date).toLocaleDateString() : "N/A",
      ]);
    });

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_${summary.sku}_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const avgCost = summary && summary.total_in_quantity > 0
    ? summary.total_in_cost / summary.total_in_quantity
    : 0;

  const stockValue = summary ? summary.current_stock * avgCost : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Inventory Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={exportToSpreadsheet}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                title="Export to Spreadsheet"
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                title="Export to PDF"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : summary ? (
            <div className="p-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Item Name</p>
                    <p className="text-lg font-semibold text-gray-900">{summary.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">SKU</p>
                    <p className="text-lg font-semibold text-gray-900">{summary.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="text-lg font-semibold text-gray-900">{summary.category_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Brand</p>
                    <p className="text-lg font-semibold text-gray-900">{summary.brand_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Unit of Measure</p>
                    <p className="text-lg font-semibold text-gray-900">{summary.uom_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    {summary.is_low_stock ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        In Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">Current Stock</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {summary.current_stock} {summary.uom_name}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Threshold: {summary.low_stock_threshold}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-900">Total In</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {summary.total_in_quantity}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    ₦{summary.total_in_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-medium text-orange-900">Total Out</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {summary.total_out_quantity}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    ₦{summary.total_out_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-medium text-purple-900">Stock Value</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    ₦{stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Avg: ₦{avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Transaction Summaries */}
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("purchase")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      activeTab === "purchase"
                        ? "border-b-2 border-green-600 text-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Purchase Summary
                  </button>
                  <button
                    onClick={() => setActiveTab("distribution")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      activeTab === "distribution"
                        ? "border-b-2 border-orange-600 text-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Distribution Summary
                  </button>
                </div>

                {/* Purchase Summary */}
                {activeTab === "purchase" && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Purchase Summary
                    </h3>
                    {purchaseSummary ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Quantity</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {purchaseSummary.total_quantity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Cost</span>
                          <span className="text-sm font-semibold text-gray-900">
                            ₦{purchaseSummary.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Transaction Count</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {purchaseSummary.transaction_count}
                          </span>
                        </div>
                        {purchaseSummary.last_transaction_date && (
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Last Purchase
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(purchaseSummary.last_transaction_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-500">No purchase records available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Distribution Summary */}
                {activeTab === "distribution" && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-orange-600" />
                      Distribution Summary
                    </h3>
                    {distributionSummary.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left px-3 py-2 border-b">Item Name</th>
                              <th className="text-left px-3 py-2 border-b">Category</th>
                              <th className="text-left px-3 py-2 border-b">Received Qty</th>
                              <th className="text-left px-3 py-2 border-b">Distributed Qty</th>
                              <th className="text-left px-3 py-2 border-b">Balance</th>
                              <th className="text-left px-3 py-2 border-b">Last Distributed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {distributionSummary.map((dist, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 border-b">
                                  {dist.item_name || dist.inventory_items?.name || "—"}
                                </td>
                                <td className="px-3 py-2 border-b">
                                  {dist.inventory_items?.categories?.name || "—"}
                                </td>
                                <td className="px-3 py-2 border-b">
                                  {dist.total_received_quantity ?? 0}
                                </td>
                                <td className="px-3 py-2 border-b">
                                  {dist.total_distributed_quantity ?? 0}
                                </td>
                                <td className="px-3 py-2 border-b">
                                  {dist.balance_quantity ?? 0}
                                </td>
                                <td className="px-3 py-2 border-b">
                                  {dist.last_distribution_date
                                    ? new Date(dist.last_distribution_date).toLocaleDateString()
                                    : "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-500">No distribution records available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Last Transaction Dates */}
              {summary.last_transaction_date && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Activity Timeline</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Last Transaction</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(summary.last_transaction_date).toLocaleString()}
                      </p>
                    </div>
                    {summary.last_purchase_date && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Last Purchase</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(summary.last_purchase_date).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Failed to load inventory details
            </div>
          )}

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}