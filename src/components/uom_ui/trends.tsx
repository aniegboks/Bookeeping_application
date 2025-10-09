"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { UOM } from "@/lib/types/uom";

interface UOMPieChartProps {
  uoms: UOM[];
}

// Muted brand colors (same tone as UOMTrendChart)
const COLORS = ["#60A5FA", "#34D399"]; // Blue (Total), Green (Added)

// Slightly transparent gradient overlay for a modern glass look
const gradientId = "pieGradient";

export default function UOMPieChart({ uoms }: UOMPieChartProps) {
  if (!uoms || uoms.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400"
      >
        No data available
      </motion.div>
    );
  }

  // Simulated "Added This Month" vs "Total"
  const addedCount = uoms.filter((uom) => {
    const date = new Date(uom.created_at);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalCount = uoms.length;
  const data = [
    { name: "Total UOMs", value: totalCount },
    { name: "Added This Month", value: addedCount },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-[#0B0C0E] dark:via-[#0F1012] dark:to-[#111214]
                 p-6 rounded-sm mb-8 border border-gray-200/60 dark:border-gray-800/60"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tighter">
          UOM (Unit of measurement)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Distribution</p>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <radialGradient id={gradientId} cx="50%" cy="50%" r="80%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
              </radialGradient>
            </defs>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={65}
              paddingAngle={4}
              cornerRadius={8}
              stroke="url(#pieGradient)"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`${COLORS[index]}cc`} // Slight transparency
                  stroke={`${COLORS[index]}40`}
                />
              ))}
            </Pie>

            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              contentStyle={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: "2px",
                border: "1px solid rgba(229,231,235,0.3)",
                backdropFilter: "blur(8px)",
                fontSize: "8px",
              }}
              labelStyle={{ fontWeight: 600, color: "#111827" }}
              itemStyle={{ color: "#374151" }}
              formatter={(value: number) => [value.toLocaleString(), "Count"]}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: "8px",
                color: "#6B7280",
                paddingTop: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
