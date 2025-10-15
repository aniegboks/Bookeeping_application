"use client";

import { useMemo } from "react";
import { AcademicSession } from "@/lib/types/academic_session";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface AcademicSessionsTrendProps {
  sessions: AcademicSession[];
}

// --- DIMMED COLOR PALETTE & STROKE SETTINGS ---
const activeColorMuted = "#34D399"; 
const inactiveColorMuted = "#FBBF24"; 

const THIN_STROKE_WIDTH = 1.5;

// Define soft gradient fill colors (very transparent)
const activeGradientStart = "rgba(52, 211, 153, 0.1)"; 
const inactiveGradientStart = "rgba(251, 191, 36, 0.1)"; 


export default function AcademicSessionsTrend({ sessions }: AcademicSessionsTrendProps) {
  const yearlyData = useMemo(() => {
    const years: Record<string, { active: number; inactive: number }> = {};

    sessions.forEach((s) => {
      // Assuming 's.start_date' is available and valid for getting the year
      const year = new Date(s.start_date).getFullYear().toString(); 
      if (!years[year]) years[year] = { active: 0, inactive: 0 };
      
      // Ensure 's.status' is defined and of the expected type ('active' | 'inactive')
      if (s.status === "active") years[year].active += 1;
      else if (s.status === "inactive") years[year].inactive += 1;
    });

    return Object.entries(years)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, { active, inactive }]) => ({
        year,
        active,
        inactive,
      }));
  }, [sessions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative rounded-sm overflow-hidden transition-all duration-300 mt-8 p-6 bg-white border border-gray-200 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#171D26] dark:text-gray-100 tracking-tighter">
          Academic Sessions Trend
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Active vs Inactive (per year)
        </p>
      </div>

      {yearlyData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          No data available
        </div>
      ) : (
        <div className="h-[400px] w-full text-sm">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {/* Gradients */}
              <defs>
                {/* Active Gradient - Uses muted color and low opacity */}
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeGradientStart} stopOpacity={1} />
                  <stop offset="95%" stopColor={activeGradientStart} stopOpacity={0} />
                </linearGradient>
                {/* Inactive Gradient - Uses muted color and low opacity */}
                <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={inactiveGradientStart} stopOpacity={1} />
                  <stop offset="95%" stopColor={inactiveGradientStart} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Subtle Grid */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(229,231,235,0.4)" // Slightly stronger grid for visibility
                vertical={false} // Cleaner look
              />

              {/* Axes */}
              <XAxis
                dataKey="year"
                tick={{ fontSize: 8, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 8, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false} // Ensure whole numbers for counts
              />

              {/* Tooltip */}
              <Tooltip
                 // Dimmed cursor based on Active color (usually the primary trend)
                cursor={{ stroke: activeColorMuted, strokeWidth: 0.8, strokeDasharray: "4 4" }} 
                contentStyle={{
                  background: "rgba(255,255,255,0.85)", // Slightly whiter background
                  backdropFilter: "blur(10px)",
                  borderRadius: "4px",
                  border: "1px solid rgba(229,231,235,0.3)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)", // Softer shadow
                  fontSize: "8px",
                }}
                labelStyle={{ color: "#111827", fontWeight: 600 }}
                itemStyle={{ color: "#374151" }}
              />

              {/* Active Line - Dimmed stroke and reduced width */}
              <Area
                type="monotone"
                dataKey="active"
                stroke={activeColorMuted} // Muted color
                strokeWidth={THIN_STROKE_WIDTH} // Thin stroke
                fillOpacity={1}
                fill="url(#colorActive)"
                activeDot={{ 
                  r: 5, // Reduced dot size
                  fill: activeColorMuted, 
                  stroke: "white", 
                  strokeWidth: 1.5 // Thin dot stroke
                }}
                name="Active Sessions"
              />

              {/* Inactive Line - Dimmed stroke and reduced width */}
              <Area
                type="monotone"
                dataKey="inactive"
                stroke={inactiveColorMuted} // Muted color
                strokeWidth={THIN_STROKE_WIDTH} // Thin stroke
                fillOpacity={1}
                fill="url(#colorInactive)"
                activeDot={{ 
                  r: 5, // Reduced dot size
                  fill: inactiveColorMuted, 
                  stroke: "white", 
                  strokeWidth: 1.5 // Thin dot stroke
                }}
                name="Inactive Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Custom legend (Updated to muted colors) */}
      <div className="flex gap-6 mt-4 ml-1 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full text-sm" style={{ backgroundColor: activeColorMuted, boxShadow: `0_0_8px_rgba(52,211,153,0.6)` }}></span>
          Active Sessions
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full text-sm" style={{ backgroundColor: inactiveColorMuted, boxShadow: `0_0_8px_rgba(251,191,36,0.6)` }}></span>
          Inactive Sessions
        </div>
      </div>
    </motion.div>
  );
}