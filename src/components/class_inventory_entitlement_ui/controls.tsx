// components/class_inventory_entitlement_ui/controls.tsx

import { Search, Plus, Upload } from "lucide-react";

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterClassId: string;
  onFilterClassIdChange: (value: string) => void;
  filterInventoryItemId: string;
  onFilterInventoryItemIdChange: (value: string) => void;
  onAdd: () => void;
  onBulkAdd?: () => void;
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
}: ControlsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by class, inventory item, term, or notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Filter by Class ID"
            value={filterClassId}
            onChange={(e) => onFilterClassIdChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] w-full sm:w-48"
          />
          <input
            type="text"
            placeholder="Filter by Item ID"
            value={filterInventoryItemId}
            onChange={(e) => onFilterInventoryItemIdChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] w-full sm:w-48"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            Add Single
          </button>
          {onBulkAdd && (
            <button
              onClick={onBulkAdd}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <Upload size={20} />
              Bulk Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}