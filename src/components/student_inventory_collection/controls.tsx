// components/student_inventory_collection/controls.tsx
"use client";

import { Plus, Upload } from "lucide-react";

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStudentId: string;
  onFilterStudentIdChange: (value: string) => void;
  filterClassId: string;
  onFilterClassIdChange: (value: string) => void;
  filterInventoryItemId: string;
  onFilterInventoryItemIdChange: (value: string) => void;
  filterReceived: string;
  onFilterReceivedChange: (value: string) => void;
  filterEligible: string;
  onFilterEligibleChange: (value: string) => void;
  onAdd: () => void;
  onBulkAdd: () => void;
  canCreate?: boolean;
}

export default function Controls({
  searchTerm,
  onSearchChange,
  filterStudentId,
  onFilterStudentIdChange,
  filterClassId,
  onFilterClassIdChange,
  filterInventoryItemId,
  onFilterInventoryItemIdChange,
  filterReceived,
  onFilterReceivedChange,
  filterEligible,
  onFilterEligibleChange,
  onAdd,
  onBulkAdd,
  canCreate = true,
}: ControlsProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search students, items, sessions..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {/* Only show action buttons if user has create permission */}
        {canCreate && (
          <div className="flex gap-2">
            <button
              onClick={onAdd}
              className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-sm transition flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Collection
            </button>
            <button
              onClick={onBulkAdd}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-sm transition flex items-center gap-2 whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Filter by student..."
          value={filterStudentId}
          onChange={(e) => onFilterStudentIdChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Filter by class..."
          value={filterClassId}
          onChange={(e) => onFilterClassIdChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Filter by item..."
          value={filterInventoryItemId}
          onChange={(e) => onFilterInventoryItemIdChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={filterReceived}
          onChange={(e) => onFilterReceivedChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Received Status</option>
          <option value="true">Received</option>
          <option value="false">Not Received</option>
        </select>
        <select
          value={filterEligible}
          onChange={(e) => onFilterEligibleChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Eligible Status</option>
          <option value="true">Eligible</option>
          <option value="false">Not Eligible</option>
        </select>
      </div>
    </div>
  );
}