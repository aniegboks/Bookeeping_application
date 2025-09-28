// components/entitlements/EntitlementsStatsCards.tsx
"use client";

import { FolderOpen, Plus, Search, Grid } from "lucide-react";

interface EntitlementsStatsCardsProps {
  total: number;
  addedToday: number;
  searchResults: number;
  viewMode: "grid" | "list";
}

export default function EntitlementsStatsCards({
  total,
  addedToday,
  searchResults,
  viewMode,
}: EntitlementsStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Entitlements */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <FolderOpen className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Entitlements</p>
            <p className="text-2xl font-semibold text-[#171D26]">{total}</p>
          </div>
        </div>
      </div>

      {/* Added Today */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <Plus className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Added Today</p>
            <p className="text-2xl font-semibold text-[#171D26]">{addedToday}</p>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Search Results</p>
            <p className="text-2xl font-semibold text-[#171D26]">{searchResults}</p>
          </div>
        </div>
      </div>

      {/* View Mode */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-100 mr-4">
            <Grid className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">View Mode</p>
            <p className="text-sm font-semibold capitalize text-[#171D26]">{viewMode}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
