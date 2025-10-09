"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { SchoolClass } from "@/lib/types/classes";

// --- Props ---
interface ClassStatusChartProps {
  classes: SchoolClass[];
}

// --- Colors (sleek modern palette) ---
const colors = {
  active: "#3B82F6", // Blue-500
  inactive: "#9CA3AF", // Gray-400
};

// --- Tooltip ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="p-3 bg-white/90 backdrop-blur-md border border-gray-200 rounded-sm text-sm">
        <p className="font-semibold" style={{ color: payload[0].fill }}>
          {name}: {value}
        </p>
      </div>
    );
  }
  return null;
};

export default function ClassStatusChart({ classes }: ClassStatusChartProps) {
  // --- Prepare chart data ---
  const chartData = useMemo(() => {
    const activeCount = classes.filter((c) => c.status === "active").length;
    const inactiveCount = classes.filter((c) => c.status === "inactive").length;

    return [
      { name: "Active", value: activeCount },
      { name: "Inactive", value: inactiveCount },
    ];
  }, [classes]);

  if (!classes.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No class data available.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white p-6 mt-8 rounded-sm border border-gray-200 mb-8 transition-all"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Class Activity Status</h2>
        <p className="text-sm text-gray-500">Active vs inactive class distribution</p>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
              stroke="none"
              label={({ name, percent }) =>
                `${name} ${(percent as number * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? colors.active : colors.inactive}
                />
              ))}
            </Pie>


            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-gray-600 text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
