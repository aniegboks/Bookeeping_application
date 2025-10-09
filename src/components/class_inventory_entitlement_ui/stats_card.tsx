"use client";

import { Package, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { ClassInventoryEntitlement } from "@/lib/types/class_inventory_entitlement";

interface StatsCardsProps {
  entitlements: ClassInventoryEntitlement[];
  filteredEntitlements: ClassInventoryEntitlement[];
}

export default function StatsCards({
  entitlements,
  filteredEntitlements,
}: StatsCardsProps) {
  const totalQuantity = entitlements.reduce((sum, e) => sum + e.quantity, 0);
  const lowStockCount = entitlements.filter((e) => e.quantity < 5).length;
  const activeEntitlements = entitlements.length;

  const lowStockPercent = activeEntitlements ? (lowStockCount / activeEntitlements) * 100 : 0;
  const filteredPercent = activeEntitlements ? (filteredEntitlements.length / activeEntitlements) * 100 : 0;

  const stats = [
    {
      title: "Total Entitlements",
      value: activeEntitlements,
      description: "All entitlements assigned to classes.",
      icon: Package,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      progress: 100,
      progressColor: "#7B61FF",
    },
    {
      title: "Total Quantity",
      value: totalQuantity,
      description: "Total quantity of all entitlements.",
      icon: TrendingUp,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      progress: 100,
      progressColor: "#61FF8C",
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      description: `${lowStockPercent.toFixed(0)}% of entitlements are low stock.`,
      icon: AlertCircle,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      progress: lowStockPercent,
      progressColor: "#FFA500",
    },
    {
      title: "Filtered Results",
      value: filteredEntitlements.length,
      description: `${filteredPercent.toFixed(0)}% of entitlements match your filter.`,
      icon: CheckCircle,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      progress: filteredPercent,
      progressColor: "#7B61FF",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-sm transition"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-center text-center lg:text-left">
            {/* Icon */}
            <div className={`p-3 rounded-full ${stat.bgColor} mb-3 lg:mb-0 lg:mr-4`}>
              <stat.icon className={stat.iconColor} />
            </div>

            {/* Text + Progress */}
            <div className="flex flex-col">
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-2xl sm:text-md md:text-lg font-bold text-[#171D26]">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1 mb-2">{stat.description}</p>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${stat.bgColor}`}
                  style={{ width: `${stat.progress}%`, opacity: 1}}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
