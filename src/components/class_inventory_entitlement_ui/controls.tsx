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
    <div className="bg-white rounded-sm border border-gray-200 border-b-0 p-4">
      <div className="flex flex-col lg:flex-row gap-4 justify-between">


        <h3 className="text-lg font-semibold tracking-tighter">Entitlements Management</h3>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute ml-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
            />
            <input
              type="text"
              placeholder="Search by class, inventory item, term, or notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            />
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79] transition-colors whitespace-nowrap text-sm"
          >
            <Plus size={20} />
            Add Single
          </button>
          {onBulkAdd && (
            <button
              onClick={onBulkAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors whitespace-nowrap text-sm"
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