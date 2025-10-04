// components/inventory_distribution_ui/controls.tsx

import { Search, Plus } from "lucide-react";

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
}

export default function Controls({
  searchTerm,
  onSearchChange,
  onAdd,
}: ControlsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by receiver name, class ID, or item ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="bg-[#3D4C63] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          New Distribution
        </button>
      </div>
    </div>
  );
}