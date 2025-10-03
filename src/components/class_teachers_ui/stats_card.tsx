// components/class_teacher_ui/stats_card.tsx

import { Users, UserCheck, UserX, Filter } from "lucide-react";
import { ClassTeacher } from "@/lib/types/class_teacher";

interface StatsCardsProps {
  teachers: ClassTeacher[];
  filteredTeachers: ClassTeacher[];
}

export default function StatsCards({ teachers, filteredTeachers }: StatsCardsProps) {
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === "active").length;
  const inactiveTeachers = teachers.filter((t) => t.status === "inactive").length;

  const stats = [
    {
      title: "Total Assignments",
      value: totalTeachers,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Teachers",
      value: activeTeachers,
      icon: UserCheck,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Inactive Teachers",
      value: inactiveTeachers,
      icon: UserX,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Filtered Results",
      value: filteredTeachers.length,
      icon: Filter,
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