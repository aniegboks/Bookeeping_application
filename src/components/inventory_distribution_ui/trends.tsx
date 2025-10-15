"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";

// Modern muted colors
const todayColor = "#34D399"; // Emerald-400
const earlierColor = "#7B61FF"; // Indigo-500

interface DistributionTrendProps {
  distributions: InventoryDistribution[];
}

export default function DistributionTrend({ distributions }: DistributionTrendProps) {
  const pieData = useMemo(() => {
    if (!distributions.length) return [];

    const total = distributions.length;

    // Count distributions added today
    const today = new Date().toLocaleDateString("en-GB");
    const addedToday = distributions.filter(
      (d) => new Date(d.created_at).toLocaleDateString("en-GB") === today
    ).length;

    const earlier = total - addedToday;

    return [
      { name: "Added Today", value: addedToday, color: todayColor },
      { name: "Earlier", value: earlier, color: earlierColor },
    ];
  }, [distributions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden transition-all duration-300 mt-8 p-6 bg-white border border-gray-200 rounded-sm mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#171D26] tracking-tight">
          Inventory Distribution Trend
        </h2>
        <p className="text-sm text-gray-500">Total vs Added Today</p>
      </div>

      {pieData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          No distribution data available
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={6}
                cornerRadius={8}
                isAnimationActive={true}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))" }}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "2px",
                  border: "1px solid rgba(229,231,235,0.3)",
                  fontSize: "8px",
                }}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: "8px", color: "#4B5563" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
