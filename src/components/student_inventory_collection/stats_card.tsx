"use client";

import { Package, CheckCircle, XCircle, Users } from "lucide-react";
import { StudentInventoryCollection } from "@/lib/types/student_inventory_collection";

interface StatsCardsProps {
  collections: StudentInventoryCollection[];
  filteredCollections: StudentInventoryCollection[];
}

// Helper: convert hex to RGB array
function hexToRgb(hex: string): [number, number, number] {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

// Helper: blend hex color toward white (for light color variants)
function lightenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);
  return `rgb(${newR}, ${newG}, ${newB})`;
}

// Helper: convert hex to rgba
function hexToRgba(hex: string, opacity: number = 1): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function StatsCards({
  collections,
  filteredCollections,
}: StatsCardsProps) {
  const totalCollections = collections.length;
  const filteredCount = filteredCollections.length;
  const receivedCount = filteredCollections.filter((c) => c.received).length;
  const eligibleCount = filteredCollections.filter((c) => c.eligible).length;
  const totalQty = filteredCollections.reduce((sum, c) => sum + c.qty, 0);
  const totalQtyAll = collections.reduce((sum, c) => sum + c.qty, 0);

  // Percentages
  const receivedPercent =
    totalCollections > 0 ? (receivedCount / totalCollections) * 100 : 0;
  const eligiblePercent =
    totalCollections > 0 ? (eligibleCount / totalCollections) * 100 : 0;
  const filteredPercent =
    totalCollections > 0 ? (filteredCount / totalCollections) * 100 : 0;
  const qtyPercent =
    totalQtyAll > 0 ? (totalQty / totalQtyAll) * 100 : 0;

  // Tailwind color map (base -600 colors)
  const colorMap = {
    blue: "#2563EB", 
    green: "#16A34A", 
    purple: "#9333EA", 
    orange: "#EA580C", 
  };

  const stats = [
    {
      title: "Total Collections",
      value: totalCollections,
      description: "All collections recorded.",
      icon: Package,
      colorHex: colorMap.blue,
      progress: 100,
    },
    {
      title: "Received Items",
      value: receivedCount,
      description: `${receivedPercent.toFixed(0)}% of all collections received.`,
      icon: CheckCircle,
      colorHex: colorMap.green,
      progress: receivedPercent,
    },
    {
      title: "Eligible Students",
      value: eligibleCount,
      description: `${eligiblePercent.toFixed(0)}% of all are eligible.`,
      icon: Users,
      colorHex: colorMap.purple,
      progress: eligiblePercent,
    },
    {
      title: "Total Quantity",
      value: totalQty,
      description: `${qtyPercent.toFixed(0)}% of total quantity filtered.`,
      icon: XCircle,
      colorHex: colorMap.orange,
      progress: qtyPercent,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-sm transition"
        >
          <div className="flex flex-col lg:flex-row items-center text-center lg:text-left">
            {/* Icon with circular background */}
            <div
              className="p-3 rounded-full mb-3 lg:mb-0 lg:mr-4 flex items-center justify-center"
              style={{ backgroundColor: hexToRgba(stat.colorHex, 0.1) }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.colorHex }} />
            </div>

            {/* Text + Progress Bar */}
            <div className="flex flex-col">
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 mb-2">
                {stat.description}
              </p>

              {/* Light Tailwind-100–like progress bar */}
              <div
                className="w-full rounded-full h-2 overflow-hidden"
                style={{
                  backgroundColor: hexToRgba(stat.colorHex, 0.1),
                }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-700 ease-in-out"
                  style={{
                    width: `${stat.progress ?? 100}%`,
                    backgroundColor: lightenHex(stat.colorHex, 0.8), // lighter like color-100
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
