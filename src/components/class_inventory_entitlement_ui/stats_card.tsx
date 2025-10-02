// components/class_entitlement_ui/stats_card.tsx

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
  const filteredQuantity = filteredEntitlements.reduce(
    (sum, e) => sum + e.quantity,
    0
  );
  const lowStockCount = entitlements.filter((e) => e.quantity < 5).length;
  const activeEntitlements = entitlements.length;

  const stats = [
    {
      title: "Total Entitlements",
      value: activeEntitlements,
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
      title: "Low Stock Items",
      value: lowStockCount,
      icon: AlertCircle,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Filtered Results",
      value: filteredEntitlements.length,
      icon: CheckCircle,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
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