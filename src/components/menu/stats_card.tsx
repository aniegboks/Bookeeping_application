"use client";

import { Plus, Menu as MenuIcon, Search, RefreshCcw } from "lucide-react";
import { Menu } from "@/lib/menu";

interface StatsCardsProps {
  menus: Menu[];
  filteredMenus: Menu[];
}

export default function MenuStatsCards({ menus, filteredMenus }: StatsCardsProps) {
  const today = new Date().toDateString();
  const total = menus.length || 0;

  const addedToday = menus.filter(m => new Date(m.created_at).toDateString() === today).length || 0;
  const updatedToday = menus.filter(m => new Date(m.updated_at).toDateString() === today).length || 0;
  const searchResults = filteredMenus.length || 0;

  const addedTodayPercent = total ? (addedToday / total) * 100 : 0;
  const updatedTodayPercent = total ? (updatedToday / total) * 100 : 0;
  const searchResultsPercent = total ? (searchResults / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card
        icon={<MenuIcon className="h-6 w-6 text-[#7B61FF]" />}
        title="Total Menus"
        value={total}
        description="All menus currently in the system."
        colorBg="#F0EBFF"
        colorBar="#7B61FF"
        progress={100}
      />

      <Card
        icon={<Plus className="h-6 w-6 text-[#61FF8C]" />}
        title="Added Today"
        value={addedToday}
        description={`${addedTodayPercent.toFixed(0)}% of total menus added today.`}
        colorBg="#E6FFEF"
        colorBar="#61FF8C"
        progress={addedTodayPercent}
      />
  
      <Card
        icon={<RefreshCcw className="h-6 w-6 text-[#FFB261]" />}
        title="Updated Today"
        value={updatedToday}
        description={`${updatedTodayPercent.toFixed(0)}% of total menus updated today.`}
        colorBg="#FFF4E6"
        colorBar="#FFB261"
        progress={updatedTodayPercent}
      />

      <Card
        icon={<Search className="h-6 w-6 text-[#61B2FF]" />}
        title="Search Results"
        value={searchResults}
        description={`${searchResultsPercent.toFixed(0)}% of total menus match your search.`}
        colorBg="#E6F2FF"
        colorBar="#61B2FF"
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
    <div className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-md transition">
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
              style={{ width: `${progress}%`, backgroundColor: colorBar, opacity: 0.4 }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}