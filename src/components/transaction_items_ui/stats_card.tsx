"use client";

import { ShoppingCart, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";

interface StatsCardsProps {
  transactions: InventoryTransaction[];
  filteredTransactions: InventoryTransaction[];
}

interface CardProps {
  title: string,
  value: string | number,
  icon: React.ReactNode,
  colorBg: string,
  progress: number,
  description: string,
}

export default function StatsCards({ transactions, filteredTransactions }: StatsCardsProps) {
  const totalTransactions = transactions.length || 0;
  const purchaseCount = transactions.filter((t) => t.transaction_type === "purchase").length || 0;
  const saleCount = transactions.filter((t) => t.transaction_type === "sale").length || 0;
  const totalValue = transactions.reduce((sum, t) => sum + (t.in_cost || 0) + (t.out_cost || 0), 0) || 0;

  const stats = [
    {
      title: "Total Transactions",
      value: totalTransactions,
      icon: <ShoppingCart className="text-blue-600" size={24} />,
      colorBg: "#E6F2FF",
      progress: 100,
      description: "All inventory transactions",
    },
    {
      title: "Purchases",
      value: purchaseCount,
      icon: <TrendingDown className="text-green-600" size={24} />,
      colorBg: "#E6FFEF",
      progress: totalTransactions ? (purchaseCount / totalTransactions) * 100 : 0,
      description: "Purchase transactions",
    },
    {
      title: "Sales",
      value: saleCount,
      icon: <TrendingUp className="text-purple-600" size={24} />,
      colorBg: "#F0EBFF",
      progress: totalTransactions ? (saleCount / totalTransactions) * 100 : 0,
      description: "Sale transactions",
    },
    {
      title: "Total Value",
      value: `₦ ${totalValue.toLocaleString()}`,
      icon: <Wallet className="text-orange-600" size={24} />,
      colorBg: "#FFF4E6",
      progress: 100,
      description: "Total transaction value",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <Card key={idx} {...stat} />
      ))}
    </div>
  );
}

function Card({ title, value, icon, colorBg, progress, description }: CardProps) {

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
              style={{ width: `${progress}%`, backgroundColor: colorBg, opacity: 0.4 }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
