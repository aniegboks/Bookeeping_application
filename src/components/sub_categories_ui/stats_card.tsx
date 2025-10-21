"use client";

import { FolderOpen, Plus, Search, Grid } from "lucide-react";

interface StatsCardsProps {
  total: number;
  addedToday: number;
  searchResults: number;
  viewMode: "grid" | "list";
}

export default function StatsCards({ total, addedToday, searchResults, viewMode }: StatsCardsProps) {
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
      />
      <Card
        icon={<Plus className="h-6 w-6 text-green-600" />}
        title="Added Today"
        value={addedToday}
        description={`${addedTodayPercent.toFixed(0)}% of total categories added today.`}
        color="green"
        progress={addedTodayPercent}
      />
      <Card
        icon={<Search className="h-6 w-6 text-blue-600" />}
        title="Search Results"
        value={searchResults}
        description={`${searchResultsPercent.toFixed(0)}% of total categories match your search.`}
        color="blue"
        progress={searchResultsPercent}
      />
      <Card
        icon={<Grid className="h-6 w-6 text-orange-600" />}
        title="View Mode"
        value={0}
        description={`Current view mode: ${viewMode}`}
        color="orange"
        progress={0}
        isTextOnly
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
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  color: string;
  progress: number;
  isTextOnly?: boolean;
}) {
  return (
    <div className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-sm transition">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
        <div className="flex flex-col">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          {value > 0 && <p className="text-2xl font-bold text-[#171D26]">{value}</p>}
          <p className="text-xs text-gray-500 mt-1 mb-2">{description}</p>

          {/* Dimmed progress bar only */}
          {!isTextOnly && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full bg-${color}-500`}
                style={{ width: `${progress}%`, opacity: 0.4 }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
