import React from 'react';
import { Supplier } from '@/lib/types/suppliers';
import { MapPin, Plus, Globe } from 'lucide-react';

interface Props {
  suppliers: Supplier[];
}

export default function StatsCards({ suppliers }: Props) {
  const stats = {
    total: suppliers.length,
    countries: new Set(suppliers.map(s => s.country)).size,
    recentlyAdded: suppliers.filter(s => {
      const created = new Date(s.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created > thirtyDaysAgo;
    }).length,
    withWebsite: suppliers.filter(s => s.website).length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card title="Total Suppliers" value={stats.total} color="blue" icon={<div className="w-6 h-6 bg-blue-600 rounded"></div>} subtitle="Active suppliers in database" />
      <Card title="Countries" value={stats.countries} color="green" icon={<MapPin className="text-green-600" size={24} />} subtitle="Geographic coverage" />
      <Card title="Recently Added" value={stats.recentlyAdded} color="purple" icon={<Plus className="text-purple-600" size={24} />} subtitle="Last 30 days" />
      <Card title="With Website" value={stats.withWebsite} color="orange" icon={<Globe className="text-orange-600" size={24} />} subtitle="Online presence" />
    </div>
  );
}

function Card({ title, value, color, icon, subtitle }: any) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-4">{subtitle}</p>
    </div>
  );
}
