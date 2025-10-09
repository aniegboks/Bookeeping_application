"use client";

import { Tag, Plus, Search, Clock } from "lucide-react";
import { UOM } from "@/lib/types/uom";

interface StatsCardsProps {
  uoms: UOM[];
  filteredUOMs: UOM[];
}

export default function StatsCards({ uoms, filteredUOMs }: StatsCardsProps) {
  const today = new Date().toDateString();

  // ✅ Safe fallback checks
  const total = uoms?.length ?? 0;
  const addedToday = uoms?.filter(
    (u) => new Date(u.created_at).toDateString() === today
  ).length ?? 0;

  const updatedToday = uoms?.filter(
    (u) => new Date(u.updated_at).toDateString() === today
  ).length ?? 0;

  const searchResults = filteredUOMs?.length ?? 0;

  const addedTodayPercent = total ? (addedToday / total) * 100 : 0;
  const updatedTodayPercent = total ? (updatedToday / total) * 100 : 0;
  const searchResultsPercent = total ? (searchResults / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total UOMs */}
      <Card
        icon={<Tag className="h-6 w-6 text-blue-600" />}
        title="Total UOMs"
        value={total}
        description="All units of measure in the system."
        colorBg="#E6F2FF"
        colorBar="#61B2FF"
        progress={100}
      />

      {/* Added Today */}
      <Card
        icon={<Plus className="h-6 w-6 text-green-600" />}
        title="Added Today"
        value={addedToday}
        description={`${addedTodayPercent.toFixed(
          0
        )}% of total UOMs added today.`}
        colorBg="#E6FFEF"
        colorBar="#61FF8C"
        progress={addedTodayPercent}
      />

      {/* Updated Today */}
      <Card
        icon={<Clock className="h-6 w-6 text-amber-600" />}
        title="Updated Today"
        value={updatedToday}
        description={`${updatedTodayPercent.toFixed(
          0
        )}% of total UOMs updated today.`}
        colorBg="#FFF7E6"
        colorBar="#FFD861"
        progress={updatedTodayPercent}
      />

      {/* Search Results */}
      <Card
        icon={<Search className="h-6 w-6 text-purple-600" />}
        title="Search Results"
        value={searchResults}
        description={`${searchResultsPercent.toFixed(
          0
        )}% of total UOMs match your search.`}
        colorBg="#F0EBFF"
        colorBar="#7B61FF"
        progress={searchResultsPercent}
      />
    </div>
  );
}

function Card({
  icon,
  title,
  value,
  description,
  colorBg,
  colorBar,
  progress,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  colorBg: string;
  colorBar: string;
  progress: number;
}) {
  return (
    <div className="bg-white rounded-md p-6 border border-gray-200 hover:shadow-sm transition">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full" style={{ backgroundColor: colorBg }}>
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#171D26]">{value}</p>
          <p className="text-xs text-gray-500 mt-1 mb-2">{description}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: colorBar,
                opacity: 0.4,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
