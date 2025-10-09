"use client";

import { StudentInventoryCollection } from "@/lib/types/student_inventory_collection";

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
  collections: StudentInventoryCollection[];
}

export default function Trends({ collections}: TrendsProps) {
  const totalCollections = collections.length;
  const totalReceived = collections.filter(c => c.received).length;

  const eligibleStudents = new Set(
    collections.filter(c => c.received).map(c => c.student_id)
  ).size;

  const data = [
    { category: "Collections", value: totalCollections },
    { category: "Received Items", value: totalReceived },
    { category: "Eligible Students", value: eligibleStudents },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full h-96 bg-white border border-gray-200 mb-4 rounded-sm p-6"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          {/* Soft grid lines */}
          <PolarGrid stroke="#e0e0e0" strokeWidth={1} />
          {/* Smooth, soft labels */}
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: "#6b7280", fontSize: 8, fontWeight: 500 }} 
          />
          <PolarRadiusAxis 
            axisLine={false} 
            tick={{ fill: "#9ca3af", fontSize: 8 }}
            tickCount={5}
          />
          {/* Soft gradient radar */}
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
          {/* Tooltip */}
          <Tooltip 
            contentStyle={{ backgroundColor: "white", borderRadius: 8, border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
            labelStyle={{ fontSize: 8, fontWeight: 500 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
