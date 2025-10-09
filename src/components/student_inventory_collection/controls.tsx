"use client";

import { Search, Plus, Upload, Filter } from "lucide-react";

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
  onBulkAdd?: () => void;
}

export default function Controls({
  searchTerm,
  onSearchChange,
  onAdd,
  onBulkAdd,
}: ControlsProps) {
  return (
    <div className="bg-white rounded-sm border border-gray-200 p-4">
      <div className="flex flex-col gap-4">
        {/* --- Search and Action Buttons --- */}
        <div className="flex justify-between items-center lg:flex-row gap-4">
          {/* Search */}
          <div className="flex">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
              />
              <input
                type="text"
                placeholder="Search by student, class, or item..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79] text-sm transition-colors whitespace-nowrap"
            >
              <Plus size={20} />
              Add Single
            </button>
            {onBulkAdd && (
              <button
                onClick={onBulkAdd}
                className="flex items-center gap-2 px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79] text-sm transition-colors whitespace-nowrap"
              >
                <Upload size={20} />
                Bulk Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
