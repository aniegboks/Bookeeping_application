// components/inventory_transaction_ui/stats_card.tsx

import { ShoppingCart, TrendingUp, TrendingDown, HandCoins, Wallet } from "lucide-react";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";

interface StatsCardsProps {
  transactions: InventoryTransaction[];
  filteredTransactions: InventoryTransaction[];
}

export default function StatsCards({
  transactions,
  filteredTransactions,
}: StatsCardsProps) {
  const totalTransactions = transactions.length;
  const purchaseCount = transactions.filter((t) => t.transaction_type === "purchase").length;
  const saleCount = transactions.filter((t) => t.transaction_type === "sale").length;
  const totalValue = transactions.reduce((sum, t) => sum + (t.in_cost || 0) + (t.out_cost || 0), 0);

  const stats = [
    {
      title: "Total Transactions",
      value: totalTransactions,
      icon: ShoppingCart,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Purchases",
      value: purchaseCount,
      icon: TrendingDown,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Sales",
      value: saleCount,
      icon: TrendingUp,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Value",
      value: `₦ ${totalValue.toLocaleString()}`,
      icon: Wallet,
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