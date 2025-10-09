"use client";

import { Search, Filter, Plus } from "lucide-react";
import { Category } from "@/lib/types/sub_categories";

interface ControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilterChange: (value: string) => void;
  categories: Category[];
  onAdd: () => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
}

export default function Controls({
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilterChange,
  categories,
  onAdd,
  viewMode,
  setViewMode
}: ControlsProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between px-5 py-4">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search sub-categories..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#171D26]"
          />
        </div>

        {/* Filter select */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={filterCategory}
            onChange={(e) => onFilterChange(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-[#171D26]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Add button */}
        {/* View mode toggle */}
        <div className="flex bg-gray-100 rounded-sm p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-sm text-sm font-medium ${viewMode==='list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-md text-sm font-medium  ${viewMode==='grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Grid
          </button>
        </div>
        <button
          onClick={onAdd}
          className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-sm transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Sub-Category
        </button>

      </div>
    </div>
  );
}
