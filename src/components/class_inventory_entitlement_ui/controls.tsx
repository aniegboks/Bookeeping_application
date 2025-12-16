// components/class_inventory_entitlement_ui/controls.tsx
"use client";

import { Search, Plus, Upload } from "lucide-react";

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterClassId: string;
  onFilterClassIdChange: (value: string) => void;
  filterInventoryItemId: string;
  onFilterInventoryItemIdChange: (value: string) => void;
  onAdd: () => void;
  onBulkAdd: () => void;
  canCreate?: boolean;
}

export default function Controls({
  searchTerm,
  onSearchChange,
  filterClassId,
  onFilterClassIdChange,
  filterInventoryItemId,
  onFilterInventoryItemIdChange,
  onAdd,
  onBulkAdd,
  canCreate = true,
}: ControlsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl font-semibold text-[#171D26] tracking-tighter">
            All Entitlements
          </h2>

          {/* Action Buttons - Only show if user has create permission */}
          {canCreate && (
            <div className="flex gap-2">
              <button
                onClick={onAdd}
                className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Add Entitlement
              </button>
              <button
                onClick={onBulkAdd}
                className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap"
              >
                <Upload className="h-4 w-4" /> Bulk Upload
              </button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search entitlements..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26]"
            />
          </div>

          {/* Class Filter */}
          <input
            type="text"
            placeholder="Filter by class..."
            value={filterClassId}
            onChange={(e) => onFilterClassIdChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26] sm:w-48"
          />

          {/* Inventory Item Filter */}
          <input
            type="text"
            placeholder="Filter by item..."
            value={filterInventoryItemId}
            onChange={(e) => onFilterInventoryItemIdChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26] sm:w-48"
          />
        </div>
      </div>
    </div>
  );
}