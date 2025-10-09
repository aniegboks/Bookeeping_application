"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { InventoryItem } from "@/lib/types/inventory_item";
import { formatCurrency } from "@/lib/utils/inventory_helper";

// Props interface
interface InventoryPriceMarginTrendProps {
  items: InventoryItem[];
}

// Chart data interface
interface ChartData {
  label: string;
  avgCost: number;
  avgSell: number;
  avgMargin: number;
}

// Radar tooltip entry type
interface RadarTooltipEntry {
  value: number;
  name: string;
  dataKey: keyof ChartData;
}

// Custom Tooltip props
interface CustomRadarTooltipProps {
  active?: boolean;
  payload?: RadarTooltipEntry[];
}

// Custom Tooltip
const CustomRadarTooltip: React.FC<CustomRadarTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/80 backdrop-blur-md border border-gray-100 rounded-lg shadow-lg text-xs">
        {payload.map((entry, index) => {
          const isMargin = entry.dataKey === "avgMargin";
          return (
            <p key={index} className="text-black py-1">
              {`${entry.name}: ${
                isMargin ? entry.value.toFixed(2) + "%" : formatCurrency(entry.value)
              }`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

// Main component
export default function InventoryPriceMarginTrend({ items }: InventoryPriceMarginTrendProps) {
  const chartData: ChartData[] = useMemo(() => {
    if (!items || !items.length) return [];

    const sortedItems = [...items].sort(
      (a, b) => new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime()
    );

    return sortedItems.map((item) => {
      const cost = Number(item.cost_price ?? 0);
      const sell = Number(item.selling_price ?? 0);
      const margin = sell > 0 ? ((sell - cost) / sell) * 100 : 0;
      const date = new Date(item.updated_at || item.created_at);
      const label = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return {
        label,
        avgCost: cost,
        avgSell: sell,
        avgMargin: margin,
      };
    });
  }, [items]);

  if (!items || !items.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No inventory data available.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/90 dark:bg-gray-900/60 backdrop-blur-xl p-8 mt-8 rounded-sm border border-gray-200 dark:border-gray-800 mb-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Inventory Price & Margin Trend
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cost vs Selling Price vs Margin
        </p>
      </div>

      <div className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="80%">
            <PolarGrid stroke="#D1D5DB" strokeOpacity={0.25} />
            <PolarAngleAxis dataKey="label" tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 500 }} />
            <PolarRadiusAxis angle={30} tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} />

            <Radar
              name="Cost"
              dataKey="avgCost"
              stroke="rgba(252,165,165,1)"
              fill="rgba(252,165,165,0.2)"
              fillOpacity={0.7}
              animationDuration={800}
            />
            <Radar
              name="Selling"
              dataKey="avgSell"
              stroke="rgba(147,197,253,1)"
              fill="rgba(147,197,253,0.2)"
              fillOpacity={0.7}
              animationDuration={800}
            />
            <Radar
              name="Margin (%)"
              dataKey="avgMargin"
              stroke="rgba(110,231,183,1)"
              fill="rgba(110,231,183,0.2)"
              fillOpacity={0.7}
              animationDuration={800}
            />

            <Tooltip
              content={<CustomRadarTooltip />}
              cursor={{ stroke: "#A1A1AA", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.4 }}
            />

            <Legend
              verticalAlign="bottom"
              align="left"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
              formatter={(value) => (
                <span className="px-2 py-1 bg-gray-100/60 dark:bg-gray-700/50 rounded-full text-xs">{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
