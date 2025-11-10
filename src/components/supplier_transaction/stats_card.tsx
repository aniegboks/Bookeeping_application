"use client";

import { DollarSign, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { SupplierTransaction } from "@/lib/types/supplier_transactions";

interface StatsCardsProps {
  transactions: SupplierTransaction[];
  filteredTransactions: SupplierTransaction[];
}

// Helpers
function hexToRgb(hex: string): [number, number, number] {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function lightenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(
    g + (255 - g) * amount
  )}, ${Math.round(b + (255 - b) * amount)})`;
}

function hexToRgba(hex: string, opacity: number = 1): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function StatsCards({
  transactions,
  filteredTransactions,
}: StatsCardsProps) {
  const totalTransactions = transactions.length;
  const filteredCount = filteredTransactions.length;

  // Compute totals
  const totalCredit = filteredTransactions.reduce(
    (sum, t) => sum + (t.credit || 0),
    0
  );
  const totalDebit = filteredTransactions.reduce(
    (sum, t) => sum + (t.debit || 0),
    0
  );
  const netAmount = totalCredit - totalDebit;

  const creditPercent =
    totalCredit + totalDebit > 0 ? (totalCredit / (totalCredit + totalDebit)) * 100 : 0;
  const debitPercent =
    totalCredit + totalDebit > 0 ? (totalDebit / (totalCredit + totalDebit)) * 100 : 0;
  const filteredPercent =
    totalTransactions > 0 ? (filteredCount / totalTransactions) * 100 : 0;

  const colorMap = {
    blue: "#2563EB",
    green: "#16A34A",
    orange: "#EA580C",
    purple: "#9333EA",
  };

  const stats = [
    {
      title: "Total Transactions",
      value: totalTransactions,
      description: "All transactions recorded.",
      icon: Activity,
      colorHex: colorMap.blue,
      progress: 100,
    },
    {
      title: "Net Amount",
      value: `₦${netAmount.toLocaleString()}`,
      description: "Credits minus debits (filtered).",
      icon: DollarSign,
      colorHex: colorMap.green,
      progress: 100,
    },
    {
      title: "Total Credit",
      value: `₦${totalCredit.toLocaleString()}`,
      description: `${creditPercent.toFixed(0)}% of total inflow.`,
      icon: TrendingUp,
      colorHex: colorMap.green,
      progress: creditPercent,
    },
    {
      title: "Total Debit",
      value: `₦${totalDebit.toLocaleString()}`,
      description: `${debitPercent.toFixed(0)}% of total outflow.`,
      icon: TrendingDown,
      colorHex: colorMap.orange,
      progress: debitPercent,
    },
    {
      title: "Filtered Results",
      value: filteredCount,
      description: `${filteredPercent.toFixed(0)}% of total transactions.`,
      icon: Activity,
      colorHex: colorMap.purple,
      progress: filteredPercent,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-sm transition"
        >
          <div className="flex flex-col lg:flex-row items-center text-center lg:text-left">
            {/* Icon */}
            <div
              className="p-3 rounded-full mb-3 lg:mb-0 lg:mr-4 flex items-center justify-center"
              style={{ backgroundColor: hexToRgba(stat.colorHex, 0.1) }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.colorHex }} />
            </div>

            {/* Text + Progress */}
            <div className="flex flex-col w-full">
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 mb-2">{stat.description}</p>

              <div
                className="w-full rounded-full h-2 overflow-hidden "
                style={{ backgroundColor: hexToRgba(stat.colorHex, 0.1), width: "80px" }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-700 ease-in-out"
                  style={{
                    width: `${stat.progress ?? 100}%`,
                    backgroundColor: lightenHex(stat.colorHex, 0.8),
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
