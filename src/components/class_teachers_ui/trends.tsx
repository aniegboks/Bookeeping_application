"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
  TooltipProps,
} from "recharts";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassTeacher } from "@/lib/types/class_teacher";

interface TeacherStatusChartProps {
  teachers: ClassTeacher[];
}

// --- Type-safe chart item ---
interface ChartItem {
  name: string;
  value: number;
  [key: string]: unknown; // satisfies Recharts Pie type safely
}

// --- Tooltip item type ---
interface PieTooltipItem {
  name: string;
  value: number;
  color: string;
}

// --- Tooltip props with correct Recharts type ---
interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: PieTooltipItem[];
}

// --- Custom tooltip ---
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg p-3 text-sm"
    >
      {payload.map((entry, idx) => (
        <p
          key={idx}
          className="font-semibold text-gray-800"
          style={{ color: entry.color }}
        >
          {`${entry.name}: ${entry.value}`}
        </p>
      ))}
    </motion.div>
  );
};

// --- Gradient colors ---
const colors: { [key: string]: string } = {
  active: "url(#activeGradient)",
  inactive: "url(#inactiveGradient)",
};

export default function TeacherStatusChart({ teachers }: TeacherStatusChartProps) {
  // Compute chart data
  const chartData: ChartItem[] = useMemo(() => {
    const active = teachers.filter((t) => t.status === "active").length;
    const inactive = teachers.filter((t) => t.status === "inactive").length;

    return [
      { name: "Active Teachers", value: active },
      { name: "Inactive Teachers", value: inactive },
    ];
  }, [teachers]);

  if (!teachers.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No teacher data
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 bg-white rounded-sm border border-gray-200 transition-shadow duration-300"
    >
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Teacher Status Overview
        </CardTitle>
        <p className="text-sm text-gray-500">
          Active vs Inactive teachers in the system
        </p>
      </CardHeader>

      <CardContent className="px-6 pt-2 pb-6">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Gradients */}
              <defs>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.9} />
                </linearGradient>
                <linearGradient id="inactiveGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity={0.9} />
                </linearGradient>
              </defs>

              <Pie
                data={chartData} // ChartItem[] fully typed
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="45%"
                outerRadius="80%"
                paddingAngle={6}
                cornerRadius={12}
                isAnimationActive
                label={(props: PieLabelRenderProps) => {
                  const name = props.name ?? "";
                  const percent = typeof props.percent === "number" ? props.percent : 0;
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? colors.active : colors.inactive}
                  />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={10} height={30} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </motion.div>
  );
}
