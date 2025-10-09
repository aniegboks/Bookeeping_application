"use client";

import React from "react";
import { Student } from "@/lib/types/students";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Tooltip with shadow for depth
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, fill } = payload[0];
    return (
      <div className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-sm text-sm">
        <p className="uppercase text-gray-500 dark:text-gray-300 text-xs tracking-wider">
          {name}
        </p>
        <p
          className="font-extrabold text-lg"
          style={{ color: fill ?? "#4F46E5" }}
        >
          {value} Students
        </p>
      </div>
    );
  }
  return null;
};

interface StatusDatum {
  name: string;
  value: number;
  fill?: string;
}

interface Props {
  students: Student[];
}

export default function StudentStatusRadarChart({ students }: Props) {
  const totalStudents = students.length;
  const totalMale = students.filter((s) => s.gender === "male").length;
  const totalFemale = students.filter((s) => s.gender === "female").length;

  const data: StatusDatum[] = [
    { name: "Active", value: students.filter((s) => s.status === "active").length, fill: "#6366F1" },
    { name: "Inactive", value: students.filter((s) => s.status === "inactive").length, fill: "#FBBF24" },
    { name: "Graduated", value: students.filter((s) => s.status === "graduated").length, fill: "#34D399" },
    { name: "Transferred", value: students.filter((s) => s.status === "transferred").length, fill: "#60A5FA" },
    { name: "Suspended", value: students.filter((s) => s.status === "suspended").length, fill: "#F87171" },
    { name: "Archived", value: students.filter((s) => s.status === "archived").length, fill: "#A78BFA" },
  ];

  return (
    <Card className="border border-gray-200 dark:border-zinc-700 shadow-none rounded-sm mb-8">
      <CardHeader className="p-6">
        <CardTitle className="text-gray-800 dark:text-gray-100 text-xl font-bold tracking-tighter">
          Student Status Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Radar Chart */}
          <div className="relative w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid gridType="polygon" strokeDasharray="4 4" stroke="rgba(148,163,184,0.15)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 500 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, Math.max(...data.map((d) => d.value)) || 1]}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                {data.map((entry, i) => (
                  <Radar
                    key={i}
                    name={entry.name}
                    dataKey="value"
                    stroke={entry.fill ?? "#6366F1"}
                    fill={entry.fill ?? "#6366F1"}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                ))}

                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>

            {/* Total student count overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalStudents}</p>
            </div>
          </div>

          {/* Legend + Gender Summary */}
          <div className="flex flex-col gap-4 min-w-[230px]">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 space-y-2">
              {data.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: d.fill ?? "#4F46E5" }} />
                  <span>
                    {d.name}: <span className="font-bold text-gray-900 dark:text-gray-100">{d.value}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-200 dark:border-zinc-700 pt-3 text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <p>
                Male: <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalMale}</span>
              </p>
              <p>
                Female: <span className="font-bold text-pink-500 dark:text-pink-400">{totalFemale}</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
