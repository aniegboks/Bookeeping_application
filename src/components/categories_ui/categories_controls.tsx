// components/categories_ui/categories_controls.tsx
"use client";

import { Search, Plus, Grid3x3, List } from "lucide-react";

interface CategoriesControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onAdd: () => void;
  canCreate?: boolean;
}

export default function CategoriesControls({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  onAdd,
  canCreate = true,
}: CategoriesControlsProps) {
  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-[#171D26] tracking-tighter">
        All Categories
      </h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26]"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white text-[#3D4C63] shadow-sm"
                : "text-gray-600 hover:text-[#3D4C63]"
            }`}
            title="Grid view"
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white text-[#3D4C63] shadow-sm"
                : "text-gray-600 hover:text-[#3D4C63]"
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Only show Add button if user has create permission */}
        {canCreate && (
          <button
            onClick={onAdd}
            className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>
    </div>
  );
}