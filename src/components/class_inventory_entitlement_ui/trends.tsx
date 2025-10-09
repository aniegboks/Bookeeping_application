"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ClassInventoryEntitlement } from "@/lib/types/class_inventory_entitlement";

// --- Props for the component ---
interface EntitlementPieChartProps {
  entitlements: ClassInventoryEntitlement[];
}

// --- Tooltip entry type (matches Pie data) ---
interface PieTooltipEntry {
  name: string;
  value: number;
  fill?: string;
  [key: string]: string | number | undefined;
}

// --- Custom Tooltip Props ---
interface CustomPieTooltipProps {
  active?: boolean;
  payload?: PieTooltipEntry[];
}

// --- DIMMED MODERN COLORS ---
const COLORS = {
  totalQuantity: "#93C5FD",
  totalEntitlements: "#6EE7B7",
  lowStockItems: "#FCA5A5",
};

const STROKES = {
  totalQuantity: "rgba(147, 197, 253, 0.7)",
  totalEntitlements: "rgba(110, 231, 183, 0.7)",
  lowStockItems: "rgba(252, 165, 165, 0.7)",
};

// --- Custom Tooltip Component ---
const CustomPieTooltip = ({ active, payload }: CustomPieTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/90 backdrop-blur-md border border-gray-100 rounded-lg shadow-xl text-sm">
        {payload.map((entry, index) => (
          <p
            key={index}
            className="font-bold text-lg"
            style={{ color: entry.fill }}
          >
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Main Component ---
export default function EntitlementPieChart({ entitlements }: EntitlementPieChartProps) {
  if (!entitlements.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400"
      >
        No entitlement data available.
      </motion.div>
    );
  }

  // --- Aggregate Data ---
  const totalQuantity = entitlements.reduce((sum, e) => sum + Number(e.quantity ?? 0), 0);
  const totalEntitlements = entitlements.length;
  const lowStockItems = entitlements.filter((e) => (e.quantity ?? 0) < 5).length;

  // --- Pie Chart Data ---
  const data: PieTooltipEntry[] = [
    { name: "Total Quantity", value: totalQuantity, fill: COLORS.totalQuantity },
    { name: "Total Entitlements", value: totalEntitlements, fill: COLORS.totalEntitlements },
    { name: "Low Stock Items", value: lowStockItems, fill: COLORS.lowStockItems },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-br from-white/90 to-[#F9FAFB]/60 dark:from-[#0B0C0E]/80 dark:to-[#111214]/60 
                 backdrop-blur-xl p-6 mt-8 rounded-sm border border-gray-200/60 dark:border-gray-800/60 mb-8 "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Entitlement Distribution
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overview of entitlements and stock status
        </p>
      </div>

      {/* Pie Chart */}
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={4}
              cornerRadius={8}
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.fill}
                  stroke={
                    STROKES[
                      entry.name.replace(/\s+/g, "").toLowerCase() as keyof typeof STROKES
                    ]
                  }
                />
              ))}
            </Pie>

            <Tooltip content={<CustomPieTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "13px", color: "#6B7280", paddingTop: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
