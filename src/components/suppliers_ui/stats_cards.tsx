"use client";

import React from "react";
import { Supplier } from "@/lib/types/suppliers";
import { MapPin, Plus, Globe, Users } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  suppliers?: Supplier[];
}

interface CardProps {
  title: string;
  value: number;
  icon: ReactNode;
  colorBg: string;
  progress: number;
  description: string;
  barColor: string;
}

export default function StatsCards({ suppliers = [] }: Props) {
  const totalSuppliers = suppliers.length;
  const countries = new Set(suppliers.map((s) => s.country)).size;
  const recentlyAdded = suppliers.filter((s) => {
    if (!s.created_at) return false;
    const created = new Date(s.created_at);
    if (isNaN(created.getTime())) return false; // Check for invalid date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created > thirtyDaysAgo;
  }).length;
  const withWebsite = suppliers.filter((s) => s.website).length;

  const stats = [
    {
      title: "Total Suppliers",
      value: totalSuppliers,
      icon: <Users className="text-blue-600" size={20} />,
      colorBg: "bg-blue-100",
      barColor: "#93C5FD",
      description: "Active suppliers in database",
      progress: 100,
    },
    {
      title: "Countries",
      value: countries,
      icon: <MapPin className="text-green-600" size={20} />,
      colorBg: "bg-green-100",
      barColor: "#86EFAC",
      description: "Geographic coverage",
      progress: totalSuppliers ? (countries / totalSuppliers) * 100 : 0,
    },
    {
      title: "Recently Added",
      value: recentlyAdded,
      icon: <Plus className="text-purple-600" size={20} />,
      colorBg: "bg-purple-100",
      barColor: "#C4B5FD",
      description: "Added in the last 30 days",
      progress: totalSuppliers ? (recentlyAdded / totalSuppliers) * 100 : 0,
    },
    {
      title: "With Website",
      value: withWebsite,
      icon: <Globe className="text-orange-600" size={20} />,
      colorBg: "bg-orange-100",
      barColor: "#FDBA74",
      description: "Online presence",
      progress: totalSuppliers ? (withWebsite / totalSuppliers) * 100 : 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <Card key={idx} {...stat} />
      ))}
    </div>
  );
}

function Card({ title, value, icon, colorBg, barColor, progress, description }: CardProps) {
  return (
    <div className="bg-white rounded-sm p-6 border border-slate-200 hover:shadow-sm transition">
      <div className="flex items-center">
        {/* Circular background for icon */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${colorBg}`}
        >
          {icon}
        </div>

        {/* Text content */}
        <div className="flex flex-col">
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{description}</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: barColor,
                opacity: 0.8,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}