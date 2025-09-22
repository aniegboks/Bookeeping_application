import { AcademicSession } from "@/lib/types/academic_session";
import { BookOpen, Calendar, Users, Eye } from "lucide-react";

export default function StatsCards({ sessions }: { sessions: AcademicSession[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total */}
      <Card
        title="Total Sessions"
        value={sessions.length}
        icon={<BookOpen className="h-6 w-6 text-blue-600" />}
        bg="bg-blue-100"
      />
      {/* Active */}
      <Card
        title="Active Sessions"
        value={sessions.filter((s) => s.status === "active").length}
        icon={<Calendar className="h-6 w-6 text-green-600" />}
        bg="bg-green-100"
      />
      {/* Inactive */}
      <Card
        title="Inactive Sessions"
        value={sessions.filter((s) => s.status === "inactive").length}
        icon={<Users className="h-6 w-6 text-yellow-600" />}
        bg="bg-yellow-100"
      />
      {/* This Month */}
      <Card
        title="This Month"
        value={
          sessions.filter((s) => {
            const now = new Date();
            const sd = new Date(s.start_date);
            return sd.getMonth() === now.getMonth() && sd.getFullYear() === now.getFullYear();
          }).length
        }
        icon={<Eye className="h-6 w-6 text-purple-600" />}
        bg="bg-purple-100"
      />
    </div>
  );
}

function Card({
  title,
  value,
  icon,
  bg,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      {/* Vertical on sm+md, horizontal on lg+ */}
      <div className="flex flex-col lg:flex-row items-center lg:items-center text-center lg:text-left">
        <div className={`p-3 rounded-full ${bg} mb-3 lg:mb-0 lg:mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-[#171D26]">{value}</p>
        </div>
      </div>
    </div>
  );
}
