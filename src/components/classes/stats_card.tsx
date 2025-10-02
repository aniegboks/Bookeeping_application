// components/school_class_ui/stats_card.tsx

import { School, Users, CheckCircle, XCircle } from "lucide-react";
import { SchoolClass } from "@/lib/types/classes";

interface StatsCardsProps {
  classes: SchoolClass[];
  filteredClasses: SchoolClass[];
}

export default function StatsCards({ classes, filteredClasses }: StatsCardsProps) {
  const totalClasses = classes.length;
  const activeClasses = classes.filter((c) => c.status === "active").length;
  const inactiveClasses = classes.filter((c) => c.status === "inactive").length;

  const stats = [
    {
      title: "Total Classes",
      value: totalClasses,
      icon: School,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Classes",
      value: activeClasses,
      icon: CheckCircle,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Inactive Classes",
      value: inactiveClasses,
      icon: XCircle,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Filtered Results",
      value: filteredClasses.length,
      icon: Users,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
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