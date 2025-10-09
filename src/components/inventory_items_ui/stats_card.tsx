"use client";

import { InventoryItem } from "@/lib/types/inventory_item";
import { Plus, Tag, Search, DollarSign } from "lucide-react";

type StatsCardsProps = {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
};

export default function StatsCards({ items, filteredItems }: StatsCardsProps) {
  const today = new Date().toDateString();
  const total = items.length;

  const addedToday = items.filter(
    (i) => new Date(i.created_at).toDateString() === today
  ).length;

  const searchResults = filteredItems.length;

  // Calculate averages
  const totalCost = items.reduce((sum, i) => sum + i.cost_price, 0);
  const totalSelling = items.reduce((sum, i) => sum + i.selling_price, 0);
  const avgCost = total ? totalCost / total : 0;
  const avgSelling = total ? totalSelling / total : 0;
  const avgMargin = total ? ((totalSelling - totalCost) / totalCost) * 100 : 0;

  const addedTodayPercent = total ? (addedToday / total) * 100 : 0;
  const searchResultsPercent = total ? (searchResults / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      <Card
        icon={<Plus className="h-6 w-6 text-green-600" />}
        title="Added Today"
        value={addedToday}
        description={`${addedTodayPercent.toFixed(0)}% of total items were added today`}
        colorBg="#E6FFEF"
        colorBar="#61FF8C"
        progress={addedTodayPercent}
      />
      <Card
        icon={<Search className="h-6 w-6 text-purple-600" />}
        title="Search Results"
        value={searchResults}
        description={`${searchResultsPercent.toFixed(0)}% of total items are displayed`}
        colorBg="#F0EBFF"
        colorBar="#7B61FF"
        progress={searchResultsPercent}
      />
      <Card
        icon={<DollarSign className="h-6 w-6 text-blue-600" />}
        title="Avg Cost Price"
        value={avgCost}
        description="Average cost price of inventory"
        colorBg="#E8F0FE"
        colorBar="#60A5FA"
        progress={50} // optional placeholder
      />
      <Card
        icon={<DollarSign className="h-6 w-6 text-green-600" />}
        title="Avg Selling Price"
        value={avgSelling}
        description="Average selling price of inventory"
        colorBg="#E6FFEF"
        colorBar="#34D399"
        progress={50} // optional placeholder
      />
      <Card
        icon={<Tag className="h-6 w-6 text-yellow-600" />}
        title="Avg Margin %"
        value={avgMargin}
        description="Average profit margin of items"
        colorBg="#FFFBE6"
        colorBar="#FACC15"
        progress={avgMargin > 100 ? 100 : avgMargin} // cap at 100%
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
  colorBg: string; // soft background
  colorBar: string; // dimmed bar
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
          <p className="text-2xl font-bold text-[#171D26]">
            {typeof value === "number" ? value.toFixed(2) : value}
          </p>
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
