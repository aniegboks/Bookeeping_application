"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Download, RefreshCw } from "lucide-react";
import { inventorySummaryApi } from "@/lib/inventory_summary";
import { InventoryItem } from "@/lib/types/inventory_item";
import { SchoolClass } from "@/lib/types/classes";
import { AcademicSession } from "@/lib/types/academic_session";
import { ClassTeacher } from "@/lib/types/class_teacher";
import { DistributionSummary } from "@/lib/types/inventory_summary";
import toast from "react-hot-toast";

// Types
interface FilterParams {
  inventory_item_id?: string;
  class_id?: string;
  session_term_id?: string;
  teacher_id?: string;
}

interface DistributionCollectionReportProps {
  inventoryItems: InventoryItem[];
  classes: SchoolClass[];
  sessions: AcademicSession[];
  teachers: ClassTeacher[];
}

export default function DistributionCollectionReport({
  inventoryItems,
  classes,
  sessions,
  teachers,
}: DistributionCollectionReportProps) {
  const [distributions, setDistributions] = useState<DistributionSummary[]>([]);
  const [filteredData, setFilteredData] = useState<DistributionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterParams>({});
  const [filters, setFilters] = useState<FilterParams>({
    inventory_item_id: "",
    class_id: "",
    session_term_id: "",
    teacher_id: "",
  });

  useEffect(() => {
    fetchDistributions();
  }, []);

  useEffect(() => {
    filterDistributions();
  }, [searchTerm, distributions]);

  const fetchDistributions = async (filterParams?: FilterParams) => {
    try {
      setLoading(true);
      setError(null);

      const params: FilterParams = {};
      
      // Only include non-empty filter values
      if (filterParams?.inventory_item_id) {
        params.inventory_item_id = filterParams.inventory_item_id;
      }
      if (filterParams?.class_id) {
        params.class_id = filterParams.class_id;
      }
      if (filterParams?.session_term_id) {
        params.session_term_id = filterParams.session_term_id;
      }
      if (filterParams?.teacher_id) {
        params.teacher_id = filterParams.teacher_id;
      }

      // Call the actual API
      const data = await inventorySummaryApi.getDistributionCollection(
        Object.keys(params).length > 0 ? params : undefined
      );

      setDistributions(data);
      setFilteredData(data);
      setActiveFilters(params);

      if (data.length === 0) {
        toast.error("No distribution records found for the selected filters.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch distribution data";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching distributions:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterDistributions = () => {
    if (!searchTerm.trim()) {
      setFilteredData(distributions);
      return;
    }

    const term = searchTerm.toLowerCase();
    setFilteredData(
      distributions.filter(
        (d) =>
          d.inventory_items.name.toLowerCase().includes(term) ||
          d.inventory_items.sku.toLowerCase().includes(term) ||
          d.inventory_items.categories.name.toLowerCase().includes(term) ||
          (d.item_name && d.item_name.toLowerCase().includes(term))
      )
    );
  };

  const applyFilters = () => {
    // Build filter params object with only non-empty values
    const filterParams: FilterParams = {};
    
    if (filters.inventory_item_id?.trim()) {
      filterParams.inventory_item_id = filters.inventory_item_id;
    }
    if (filters.class_id?.trim()) {
      filterParams.class_id = filters.class_id;
    }
    if (filters.session_term_id?.trim()) {
      filterParams.session_term_id = filters.session_term_id;
    }
    if (filters.teacher_id?.trim()) {
      filterParams.teacher_id = filters.teacher_id;
    }

    fetchDistributions(filterParams);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      inventory_item_id: "",
      class_id: "",
      session_term_id: "",
      teacher_id: "",
    });
    setActiveFilters({});
    setSearchTerm("");
    fetchDistributions();
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Item Name",
      "SKU",
      "Category",
      "Distributed",
      "Received",
      "Balance",
      "Last Distribution",
    ];
    
    const rows = filteredData.map((d) => [
      `"${d.inventory_items.name.replace(/"/g, '""')}"`,
      d.inventory_items.sku,
      `"${d.inventory_items.categories.name.replace(/"/g, '""')}"`,
      d.total_distributed ?? d.total_distributed_quantity ?? 0,
      d.total_received ?? d.total_received_quantity ?? 0,
      d.balance_quantity,
      new Date(d.last_distribution_date).toLocaleDateString(),
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distribution-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Report exported successfully");
  };

  const stats = filteredData.reduce(
    (acc, d) => ({
      totalDistributed:
        acc.totalDistributed + (d.total_distributed ?? d.total_distributed_quantity ?? 0),
      totalReceived:
        acc.totalReceived + (d.total_received ?? d.total_received_quantity ?? 0),
      totalBalance: acc.totalBalance + d.balance_quantity,
    }),
    { totalDistributed: 0, totalReceived: 0, totalBalance: 0 }
  );

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-sm p-12 border border-gray-200">
        <div className="flex flex-col items-center justify-center">
          <RefreshCw className="animate-spin w-8 h-8 text-blue-600 mb-3" />
          <span className="text-gray-700 font-medium">Loading distribution data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm mb-6 border border-gray-200">
      {/* Header + Filters */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Distribution Collection Report</h2>
            <p className="text-sm text-gray-500">Track inventory distributions and collections</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors ${
                hasActiveFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : ''
              }`}
            >
              <Filter className="h-4 w-4" /> Filters
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {Object.keys(activeFilters).length}
                </span>
              )}
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredData.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#3D4C63] text-white rounded-md hover:bg-[#2f3a4e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm">
            <p className="text-sm text-blue-700 font-medium">Total Distributed</p>
            <p className="text-2xl font-bold text-blue-900">
              {stats.totalDistributed.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-sm">
            <p className="text-sm text-green-700 font-medium">Total Received</p>
            <p className="text-2xl font-bold text-green-900">
              {stats.totalReceived.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-sm">
            <p className="text-sm text-purple-700 font-medium">Current Balance</p>
            <p className="text-2xl font-bold text-purple-900">
              {stats.totalBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Inventory Item
                </label>
                <select
                  value={filters.inventory_item_id}
                  onChange={(e) =>
                    setFilters({ ...filters, inventory_item_id: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                >
                  <option value="">All Items</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Class</label>
                <select
                  value={filters.class_id}
                  onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                >
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Session Term
                </label>
                <select
                  value={filters.session_term_id}
                  onChange={(e) =>
                    setFilters({ ...filters, session_term_id: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                >
                  <option value="">All Sessions</option>
                  {sessions.map((sess) => (
                    <option key={sess.id} value={sess.id}>
                      {sess.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Teacher</label>
                <select
                  value={filters.teacher_id}
                  onChange={(e) => setFilters({ ...filters, teacher_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                >
                  <option value="">All Teachers</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-[#3D4C63] text-white rounded-md hover:bg-[#2f3a4e] transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(activeFilters).map(([key, value]) => {
              let label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              let displayValue = value;
              
              if (key === 'inventory_item_id') {
                const item = inventoryItems.find(i => i.id === value);
                displayValue = item?.name || value;
              } else if (key === 'class_id') {
                const cls = classes.find(c => c.id === value);
                displayValue = cls?.name || value;
              } else if (key === 'session_term_id') {
                const sess = sessions.find(s => s.id === value);
                displayValue = sess?.name || value;
              } else if (key === 'teacher_id') {
                const teacher = teachers.find(t => t.id === value);
                displayValue = teacher?.name || value;
              }
              
              return (
                <span key={key} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  <span className="font-medium">{label}:</span> {displayValue}
                </span>
              );
            })}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"  />
          <input
            type="text"
            placeholder="Search by item name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={() => fetchDistributions(activeFilters)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-600">Item</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600">Category</th>
              <th className="px-6 py-3 text-right font-medium text-gray-600">Distributed</th>
              <th className="px-6 py-3 text-right font-medium text-gray-600">Received</th>
              <th className="px-6 py-3 text-right font-medium text-gray-600">Balance</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600">
                Last Distribution
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((d) => (
                <tr key={d.inventory_item_id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{d.inventory_items.name}</div>
                    <div className="text-xs text-gray-500">SKU: {d.inventory_items.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{d.inventory_items.categories.name}</td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    {(d.total_distributed ?? d.total_distributed_quantity ?? 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    {(d.total_received ?? d.total_received_quantity ?? 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {d.balance_quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Date(d.last_distribution_date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-gray-400 mb-2">
                    <Search className="mx-auto mb-2" size={48} />
                  </div>
                  <p className="text-gray-600 font-medium">No distribution records found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {hasActiveFilters || searchTerm 
                      ? "Try adjusting your filters or search terms"
                      : "No distribution data available"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing <strong>{filteredData.length}</strong> of <strong>{distributions.length}</strong> records
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[#3D4C63] hover:text-[#2f3a4e] font-medium transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}