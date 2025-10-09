"use client";

import React from "react";
import { Users, Shield, UserCog, UserCheck } from "lucide-react";
import { User } from "@/lib/types/user";

interface StatsCardsProps {
  users: User[];
  filteredUsers: User[];
}

export default function StatsCards({ users, filteredUsers }: StatsCardsProps) {
  const totalUsers = users.length;

  const teachers = users.filter(
    (u) =>
      Array.isArray(u.roles) &&
      u.roles.some((r) => r.toLowerCase() === "teacher")
  ).length;

  const admins = users.filter(
    (u) =>
      Array.isArray(u.roles) &&
      u.roles.some((r) => r.toLowerCase() === "admin")
  ).length;

  const superadmins = users.filter(
    (u) =>
      Array.isArray(u.roles) &&
      u.roles.some((r) => r.toLowerCase() === "superadmin")
  ).length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: <Users className="text-blue-600" size={24} />,
      colorBg: "#E6F2FF",
      progress: 100,
      description: "All users in the system",
    },
    {
      title: "Teachers",
      value: teachers,
      icon: <UserCheck className="text-green-600" size={24} />,
      colorBg: "#E6FFEF",
      progress: totalUsers ? (teachers / totalUsers) * 100 : 0,
      description: "Users with the teacher role",
    },
    {
      title: "Admins",
      value: admins,
      icon: <UserCog className="text-purple-600" size={24} />,
      colorBg: "#F0EBFF",
      progress: totalUsers ? (admins / totalUsers) * 100 : 0,
      description: "Users with the admin role",
    },
    {
      title: "Super Admins",
      value: superadmins,
      icon: <Shield className="text-orange-600" size={24} />,
      colorBg: "#FFF4E6",
      progress: totalUsers ? (superadmins / totalUsers) * 100 : 0,
      description: "Users with the superadmin role",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <Card key={idx} {...stat} />
      ))}
    </div>
  );
}

interface CardProps {
  title: string;
  value: number;
  icon: React.ReactNode; 
  colorBg: string;
  progress: number;
  description: string;
}

function Card({ title, value, icon, colorBg, progress, description }: CardProps) {
  return (
    <div className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full" style={{ backgroundColor: colorBg }}>
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#171D26]">{value}</p>
          <p className="text-xs text-gray-500 mt-1 mb-2">{description}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: colorBg,
                opacity: 0.7,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
