// components/class_entitlement_ui/controls.tsx

import { Search, Plus, Filter } from "lucide-react";

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterClassId: string;
  onFilterClassIdChange: (value: string) => void;
  filterInventoryItemId: string;
  onFilterInventoryItemIdChange: (value: string) => void;
  onAdd: () => void;
}

export default function Controls({
  searchTerm,
  onSearchChange,
  filterClassId,
  onFilterClassIdChange,
  filterInventoryItemId,
  onFilterInventoryItemIdChange,
  onAdd,
}: ControlsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search entitlements..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            />
          </div>
        </div>

        {/* Filter by Class ID */}
        <div className="flex-1">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Filter by Class ID..."
              value={filterClassId}
              onChange={(e) => onFilterClassIdChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            />
          </div>
        </div>

        {/* Filter by Inventory Item ID */}
        <div className="flex-1">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Filter by Item ID..."
              value={filterInventoryItemId}
              onChange={(e) => onFilterInventoryItemIdChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="bg-[#3D4C63] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          Add Entitlement
        </button>
      </div>
    </div>
  );
}