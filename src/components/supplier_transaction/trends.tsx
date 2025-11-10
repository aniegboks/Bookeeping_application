"use client";

import { SupplierTransaction } from "@/lib/types/supplier_transactions";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface TrendsProps {
  transactions: SupplierTransaction[];
}

export default function Trends({ transactions }: TrendsProps) {
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(
    (t) => t.status === "completed"
  ).length;
  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending"
  ).length;
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Normalize amount for visualization (divide by 1000 or scale appropriately)
  const normalizedAmount = Math.min(totalAmount / 10000, 100);

  const data = [
    { category: "Total Transactions", value: totalTransactions },
    { category: "Completed", value: completedTransactions },
    { category: "Pending", value: pendingTransactions },
    { category: "Amount (x10k)", value: normalizedAmount },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full h-96 bg-white border border-gray-200 mb-4 rounded-sm p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Transaction Trends
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#e0e0e0" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            axisLine={false}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickCount={5}
          />
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <Radar
            name="Stats"
            dataKey="value"
            stroke="#93c5fd"
            strokeWidth={1.5}
            fill="url(#radarGradient)"
            fillOpacity={0.8}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: 8,
              border: "none",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ fontSize: 12, fontWeight: 500 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}