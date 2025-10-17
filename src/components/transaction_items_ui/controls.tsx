"use client";

import { useEffect } from "react";
import { Search, Filter, Plus } from "lucide-react";

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAddTransaction: () => void;
}

export default function Controls({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  onAddTransaction,
}: ControlsProps) {
  useEffect(() => {
    if (!typeFilter) {
      onTypeFilterChange("purchase");
    }
  }, [typeFilter, onTypeFilterChange]);

  return (
    <div className="bg-white rounded-sm border border-gray-200 border-b-0 p-4 relative">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by reference, item, or notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            />
          </div>
        </div>

        <div className="flex gap-4">
          {/* Type Filter */}
          <div className="w-full lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={typeFilter}
                onChange={(e) => onTypeFilterChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] appearance-none bg-white"
              >
                <option value="">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Add Transaction Button */}
          <div className="w-full lg:w-auto">
            <button
              onClick={onAddTransaction}
              className="bg-[#3D4C63] text-white px-6 py-2 rounded-sm flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap w-full lg:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              New Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
