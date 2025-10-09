"use client";

import { FolderOpen, Plus, Search, Grid } from "lucide-react";

interface StatsCardsProps {
  total: number;
  addedToday: number;
  searchResults: number;
  viewMode: "grid" | "list";
  opacity?: number;
}

export default function StatsCards({
  total,
  addedToday,
  searchResults,
  viewMode,
  opacity = 0.4,
}: StatsCardsProps) {
  const addedTodayPercent = total ? (addedToday / total) * 100 : 0;
  const searchResultsPercent = total ? (searchResults / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card
        icon={<FolderOpen className="h-6 w-6 text-purple-600" />}
        title="Total Categories"
        value={total}
        description="All categories in the system."
        color="purple"
        progress={100}
        opacity={1}
      />

      <Card
        icon={<Plus className="h-6 w-6 text-green-600" />}
        title="Added Today"
        value={addedToday || 0}
        description={`${addedTodayPercent ? addedTodayPercent.toFixed(0) : 0}% of total categories added today.`}
        color="green"
        progress={addedTodayPercent || 0}
        opacity={opacity}
      />

      <Card
        icon={<Search className="h-6 w-6 text-blue-600" />}
        title="Search Results"
        value={searchResults || 0}
        description={`${searchResultsPercent ? searchResultsPercent.toFixed(0) : 0}% matched categories search.`}
        color="blue"
        progress={searchResultsPercent || 0}
        opacity={opacity}
      />

      <Card
        icon={<Grid className="h-6 w-6 text-orange-600" />}
        title="View Mode"
        description={`Current view mode: ${viewMode === "grid" ? "Grid" : "List"}`}
        color="orange"
        progress={0}
        isTextOnly
        opacity={opacity}
      />
    </div>
  );
}

function Card({
  icon,
  title,
  value,
  description,
  color,
  progress,
  isTextOnly = false,
  opacity = 0.4,
}: {
  icon: React.ReactNode;
  title: string;
  value?: number;
  description: string;
  color: string;
  progress: number;
  isTextOnly?: boolean;
  opacity?: number;
}) {
  // Only render filled bar if progress > 0
  const showProgress = progress > 0;

  // Map colors safely for Tailwind
  const bgColorClass = {
    purple: "bg-purple-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
  }[color] || "bg-gray-500";

  const bgLightClass = {
    purple: "bg-purple-100",
    green: "bg-green-100",
    blue: "bg-blue-100",
    orange: "bg-orange-100",
  }[color] || "bg-gray-100";

  return (
    <div className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-sm transition">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${bgLightClass}`}>{icon}</div>
        <div className="flex flex-col">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          {value !== undefined && <p className="text-2xl font-bold text-[#171D26]">{value}</p>}
          <p className="text-xs text-gray-500 mt-1 mb-2">{description}</p>
          {!isTextOnly && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              {showProgress && (
                <div
                  className={`h-2 rounded-full ${bgColorClass}`}
                  style={{ width: `${progress}%`, opacity }}
                ></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
