"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, PieLabelRenderProps } from "recharts";
import { motion } from "framer-motion";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";

interface InventoryTransactionChartProps {
  transactions: InventoryTransaction[];
}

// Colors for the chart
const COLORS = ["#3B82F6", "#EF4444"]; // Blue = In, Red = Out

// Custom tooltip
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-3 bg-white/90 backdrop-blur-md border border-gray-100 rounded-sm shadow-sm text-sm">
        <p className="text-gray-500 font-medium mb-1">{data.name}</p>
        <p className="font-bold text-lg" style={{ color: data.fill }}>
          {data.value} Units
        </p>
      </div>
    );
  }
  return null;
};

export default function InventoryTransactionChart({ transactions }: InventoryTransactionChartProps) {
  const chartData = useMemo(() => {
    const quantityIn = transactions.reduce((sum, t) => sum + (t.qty_in ?? 0), 0);
    const quantityOut = transactions.reduce((sum, t) => sum + (t.qty_out ?? 0), 0);

    return [
      { name: "Quantity In", value: quantityIn },
      { name: "Quantity Out", value: quantityOut },
    ];
  }, [transactions]);

  if (!transactions.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No transaction data available.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white p-6 mt-8 rounded-sm border border-gray-200  overflow-hidden mb-8"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Inventory Movement</h2>
        <p className="text-sm text-gray-500">Overview of quantity in vs out</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={5}
              cornerRadius={8}
              label={(props: PieLabelRenderProps) => {
                // percent may be undefined
                const name = props.name ?? "Unknown";
                const percent = typeof props.percent === "number" ? props.percent : 0;
                return `${name}: ${(percent * 100).toFixed(0)}%`;
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={30}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", color: "#6B7280", paddingTop: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
