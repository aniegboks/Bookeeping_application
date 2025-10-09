import { AcademicSession } from "@/lib/types/academic_session";
import { BookOpen, Calendar, Users, Eye } from "lucide-react";

export default function StatsCards({ sessions }: { sessions: AcademicSession[] }) {
  const total = sessions.length;
  const active = sessions.filter((s) => s.status === "active").length;
  const inactive = sessions.filter((s) => s.status === "inactive").length;
  const now = new Date();
  const thisMonth = sessions.filter((s) => {
    const sd = new Date(s.start_date);
    return sd.getMonth() === now.getMonth() && sd.getFullYear() === now.getFullYear();
  }).length;

  const activePercent = total ? (active / total) * 100 : 0;
  const inactivePercent = total ? (inactive / total) * 100 : 0;
  const thisMonthPercent = total ? (thisMonth / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card
        title="Total Sessions"
        value={total}
        description="All sessions scheduled so far."
        icon={<BookOpen className="h-6 w-6 text-blue-600" />}
        bg="bg-blue-100"
        progress={100}
      />
      <Card
        title="Active Sessions"
        value={active}
        description={`${activePercent.toFixed(0)}% of all sessions are currently active.`}
        icon={<Calendar className="h-6 w-6 text-green-600" />}
        bg="bg-green-100"
        progress={activePercent}
      />
      <Card
        title="Inactive Sessions"
        value={inactive}
        description={`${inactivePercent.toFixed(0)}% of sessions have ended or are inactive.`}
        icon={<Users className="h-6 w-6 text-yellow-600" />}
        bg="bg-yellow-100"
        progress={inactivePercent}
      />
      <Card
        title="This Month"
        value={thisMonth}
        description={`Sessions starting this month (${thisMonthPercent.toFixed(0)}% of total).`}
        icon={<Eye className="h-6 w-6 text-purple-600" />}
        bg="bg-purple-100"
        progress={thisMonthPercent}
      />
    </div>
  );
}

function Card({
  title,
  value,
  description,
  icon,
  bg,
  progress,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  bg: string;
  progress: number; // percentage 0-100
}) {
  return (
    <div className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-sm transition">
      <div className="flex flex-col lg:flex-row items-center lg:items-center text-center lg:text-left">
        <div className={`p-3 rounded-full ${bg} mb-3 lg:mb-0 lg:mr-4`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl sm:text-md md:text-lg font-bold text-[#171D26]">{value}</p>
          <p className="text-xs text-gray-500 mt-1 mb-2">{description}</p>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${bg}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
