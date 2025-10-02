// components/user_ui/stats_card.tsx

import { Users, Mail, Phone, Filter } from "lucide-react";
import { User } from "@/lib/types/user";

interface StatsCardsProps {
  users: User[];
  filteredUsers: User[];
}

export default function StatsCards({ users, filteredUsers }: StatsCardsProps) {
  const totalUsers = users.length;
  const usersWithEmail = users.filter((u) => u.email).length;
  const usersWithPhone = users.filter((u) => u.phone).length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Users with Email",
      value: usersWithEmail,
      icon: Mail,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Users with Phone",
      value: usersWithPhone,
      icon: Phone,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Filtered Results",
      value: filteredUsers.length,
      icon: Filter,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}