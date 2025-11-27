// components/classes/controls.tsx
"use client";

import { Search, Plus } from "lucide-react";

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAdd: () => void;
  canCreate?: boolean;
}

export default function Controls({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAdd,
  canCreate = true,
}: ControlsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold text-[#171D26] tracking-tighter">
          All Classes
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26] bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Only show Add button if user has create permission */}
          {canCreate && (
            <button
              onClick={onAdd}
              className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Add Class
            </button>
          )}
        </div>
      </div>
    </div>
  );
}