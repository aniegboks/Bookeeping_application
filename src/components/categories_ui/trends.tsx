"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

interface CategoriesTrendProps {
  categories: Category[];
}

// Muted Colors
const totalColorMuted = "#60A5FA"; // Sky-400
const addedColorMuted = "#34D399"; // Emerald-400

export default function CategoriesTrend({ categories }: CategoriesTrendProps) {
  const pieData = useMemo(() => {
    if (!categories.length) return [];

    const total = categories.length;

    // Count categories added today
    const today = new Date().toLocaleDateString("en-GB");
    const addedToday = categories.filter(
      (c) =>
        new Date(c.created_at).toLocaleDateString("en-GB") === today
    ).length;

    const older = total - addedToday;

    return [
      { name: "Added Today", value: addedToday, color: addedColorMuted },
      { name: "Earlier", value: older, color: totalColorMuted },
    ];
  }, [categories]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden transition-all duration-300 mt-10 p-8 rounded-md 
                 bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 mb-8"
    >
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-6">
        Categories Distribution
      </h2>

      {/* Chart */}
      {pieData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
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
                paddingAngle={4}
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
