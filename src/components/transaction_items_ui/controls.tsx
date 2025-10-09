"use client";

import { useState } from "react";
import { Search, Plus, Filter, ChevronDown } from "lucide-react";

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAddTransaction: () => void;
  onAddDistribution: () => void;
}

export default function Controls({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  onAddTransaction,
  onAddDistribution,
}: ControlsProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="bg-white rounded-sm border border-gray-200 border-b-0 p-4 relative">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="flex w-full">
          <div className="relative">
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

        {/* Add Button with Toggle */}
        <div className="relative w-full lg:w-auto">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="bg-[#3D4C63] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap w-full lg:w-auto justify-center"
          >
            <Plus size={20} />
            Add
            <ChevronDown size={16} />
          </button>

          {/* Dropdown Menu */}
          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  onAddTransaction();
                  setShowAddMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Add Transaction
              </button>
              <button
                onClick={() => {
                  onAddDistribution();
                  setShowAddMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Add Distribution
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
