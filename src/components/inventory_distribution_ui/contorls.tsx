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
    <div className="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 h-4 w-4"/>
            <input
              type="text"
              placeholder="Search by class, item, or receiver..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="group relative bg-gradient-to-r from-[#3D4C63] to-[#3D4C63] text-white px-6 py-3.5 rounded-sm flex items-center gap-2 hover:from-[#3D4C63] hover:to-[#3D4C63] transition-all duration-200 shadow-sm hover:shadow-lg w-full sm:w-auto justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Plus size={20} className="relative z-10" />
          <span className="relative z-10 font-medium">Distribute Items</span>
        </button>
      </div>
    </div>
  );
}