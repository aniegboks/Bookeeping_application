"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { motion } from "framer-motion";
import { User } from "@/lib/types/user";

interface RolePieChartProps {
  users: User[];
}

// Brighter palette inspired by StatsCards color tone
const COLORS = ["#3D4C63", "#506280", "#6880A6", "#8CA8D6"];

export default function RolePieChart({ users }: RolePieChartProps) {
  const roleData = [
    { name: "Super Admin", value: users.filter(u => u.roles?.includes("super_admin")).length },
    { name: "Admin", value: users.filter(u => u.roles?.includes("admin")).length },
    { name: "User", value: users.filter(u => u.roles?.includes("user")).length },
  ];

  if (!users.length)
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No user data available.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 my-8 rounded-sm border border-gray-200"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-2">User Role Distribution</h2>
      <p className="text-sm text-gray-500 mb-6">Percentage of users by role</p>

      {/* Larger chart for visual clarity */}
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={roleData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={135}
              paddingAngle={4}
              stroke="white"
              style={{ mixBlendMode: "multiply" }}
              labelLine={false}
              label={({ name, percent }: PieLabelRenderProps) =>
                `${name}: ${(((percent as number) || 0) * 100).toFixed(0)}%`
              }
            >
              {roleData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-transform duration-300 hover:scale-105"
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number) => `${value} users`}
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                color: "#111827",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              wrapperStyle={{
                fontSize: "8px",
                color: "#374151",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
