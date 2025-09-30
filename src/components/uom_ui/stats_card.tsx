import { Tag, Plus, Search } from "lucide-react";
import { UOM } from "@/lib/types/uom";

interface StatsCardsProps {
  uoms: UOM[];
  filteredUOMs: UOM[];
}

export default function StatsCards({ uoms, filteredUOMs }: StatsCardsProps) {
  const today = new Date().toDateString();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card icon={<Tag className="h-6 w-6 text-blue-600" />} title="Total UOMs" value={uoms.length} color="blue" />
      <Card
        icon={<Plus className="h-6 w-6 text-green-600" />}
        title="Added Today"
        value={uoms.filter(u => new Date(u.created_at).toDateString() === today).length}
        color="green"
      />
      <Card icon={<Search className="h-6 w-6 text-purple-600" />} title="Search Results" value={filteredUOMs.length} color="purple" />
    </div>
  );
}

function Card({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number; color: string }) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-4`}>
      <div className={`p-3 rounded-full bg-${color}-100`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-[#171D26]">{value}</p>
      </div>
    </div>
  );
}
