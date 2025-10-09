"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Supplier } from "@/lib/types/suppliers";

// --- Modern palette ---
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16"];

interface SupplierPieChartProps {
  suppliers: Supplier[];
}

// --- Custom Tooltip ---
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="p-3 bg-white/90 backdrop-blur-md border border-gray-100 rounded-sm text-sm">
        <p className="font-semibold text-gray-800">{entry.name}</p>
        <p className="text-gray-600">
          {entry.value} supplier{entry.value > 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export default function SupplierPieChart({ suppliers }: SupplierPieChartProps) {
  const data = useMemo(() => {
    if (!suppliers?.length) return [];

    const grouped: Record<string, number> = {};
    suppliers.forEach((s) => {
      const country = s.country || "Unknown";
      grouped[country] = (grouped[country] || 0) + 1;
    });

    return Object.entries(grouped).map(([country, count]) => ({
      name: country,
      value: count,
    }));
  }, [suppliers]);

  if (!suppliers.length)
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No supplier data available.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white p-6 mt-8 rounded-sm border border-gray-200"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Suppliers by Country</h2>
        <p className="text-sm text-gray-500">
          Visual distribution of suppliers across countries
        </p>
      </div>

      <div className="h-[400px] flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              innerRadius={60}
              paddingAngle={3}
              labelLine={false}
              label={({ name, percent }) => {
                const p = typeof percent === "number" ? percent : 0;
                return `${name} (${(p * 100).toFixed(1)}%)`;
              }}

            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip content={<CustomPieTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={6}
              iconType="circle"
              wrapperStyle={{
                fontSize: "10px",
              }}
              formatter={(value: string) => (
                <span style={{ color: "#000", fontSize: "10px", fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />

          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}


