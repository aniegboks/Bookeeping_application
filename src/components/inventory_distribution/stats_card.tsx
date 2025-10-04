// components/inventory_distribution_ui/stats_card.tsx

import { Package, TrendingUp, Users, Calendar } from "lucide-react";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";

interface StatsCardsProps {
  distributions: InventoryDistribution[];
  filteredDistributions: InventoryDistribution[];
}

export default function StatsCards({ 
  distributions, 
  filteredDistributions 
}: StatsCardsProps) {
  const totalDistributions = distributions.length;
  const totalQuantity = distributions.reduce(
    (sum, d) => sum + d.distributed_quantity, 
    0
  );
  const uniqueClasses = new Set(distributions.map(d => d.class_id)).size;
  const thisMonth = distributions.filter(d => {
    const date = new Date(d.distribution_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    {
      title: "Total Distributions",
      value: totalDistributions,
      icon: Package,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Quantity",
      value: totalQuantity,
      icon: TrendingUp,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Classes Served",
      value: uniqueClasses,
      icon: Users,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "This Month",
      value: thisMonth,
      icon: Calendar,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}