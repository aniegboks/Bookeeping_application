// components/inventory_distribution_ui/stats_card.tsx

"use client";

import { Package, Users, TrendingUp, Calendar } from "lucide-react";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";

interface StatsCardsProps {
  distributions: InventoryDistribution[];
  filteredDistributions: InventoryDistribution[];
}

export default function StatsCards({
  distributions,
}: StatsCardsProps) {
  const totalDistributions = distributions.length;
  const totalQuantity = distributions.reduce((sum, d) => sum + d.distributed_quantity, 0);
  const uniqueClasses = new Set(distributions.map((d) => d.class_id)).size;
  const thisMonth = distributions.filter((d) => {
    const date = new Date(d.distribution_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const thisMonthPercent =
    totalDistributions > 0 ? (thisMonth / totalDistributions) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card
        title="Total Distributions"
        value={totalDistributions}
        description="All inventory distributions recorded."
        icon={<Package className="h-6 w-6 text-blue-600" />}
        bg="bg-blue-100"
        progress={100}
      />
      <Card
        title="Total Quantity Distributed"
        value={totalQuantity}
        description="Total items distributed so far."
        icon={<TrendingUp className="h-6 w-6 text-green-600" />}
        bg="bg-green-100"
        progress={100}
      />
      <Card
        title="Classes Covered"
        value={uniqueClasses}
        description="Unique classes that received distributions."
        icon={<Users className="h-6 w-6 text-yellow-600" />}
        bg="bg-yellow-100"
        progress={(uniqueClasses / (totalDistributions || 1)) * 100}
      />
      <Card
        title="This Month"
        value={thisMonth}
        description={`Distributions made this month (${thisMonthPercent.toFixed(0)}% of total).`}
        icon={<Calendar className="h-6 w-6 text-purple-600" />}
        bg="bg-purple-100"
        progress={thisMonthPercent}
      />
    </div>
  );
}

function Card({
  title,
  value,
  description,
  icon,
  bg,
  progress,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  bg: string;
  progress: number; // percentage 0–100
}) {
  return (
    <div className="group relative bg-white rounded-sm hover:shadow-sm transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-md transition">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${bg}`}>{icon}</div>
          <div className="flex flex-col">
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-[#171D26]">{value}</p>
            <p className="text-xs text-gray-500 mt-1 mb-2">{description}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: bg.includes("blue")
                    ? "#3B82F6"
                    : bg.includes("green")
                    ? "#10B981"
                    : bg.includes("yellow")
                    ? "#FACC15"
                    : "#8B5CF6",
                  opacity: 0.8,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
