"use client";

import { FileText, CheckCircle, Package, Clock } from "lucide-react";

interface ReportStatsCardsProps {
  total: number;
  eligible: number;
  received: number;
  pending: number;
}

export function ReportStatsCards({ total, eligible, received, pending }: ReportStatsCardsProps) {
  const eligiblePercentage = total > 0 ? ((eligible / total) * 100).toFixed(1) : 0;
  const receivedPercentage = total > 0 ? ((received / total) * 100).toFixed(1) : 0;
  const pendingPercentage = total > 0 ? ((pending / total) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:mb-4 border-b border-gray-200 pb-4 print:border-0 print:pb-0">
      {/* Total Records */}
      <div className="bg-white rounded-sm border border-gray-200 hover:shadow-sm p-4 transition">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-600">Total Records</div>
          <div className="p-2 bg-gray-100 rounded-lg">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{total}</div>
        <div className="text-xs text-gray-500">All inventory collections</div>
      </div>

      {/* Eligible */}
      <div className="bg-green-50 rounded-sm border border-green-200 hover:shadow-sm p-4 transition">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-green-600">Eligible</div>
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-green-700 mb-1">{eligible}</div>
        <div className="text-xs text-green-600">{eligiblePercentage}% of total</div>
      </div>

      {/* Received */}
      <div className="bg-blue-50 rounded-sm hover:shadow-sm p-4 border border-blue-200 transition">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-blue-600">Received</div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-blue-700 mb-1">{received}</div>
        <div className="text-xs text-blue-600">{receivedPercentage}% of total</div>
      </div>

      {/* Pending */}
      <div className="bg-orange-50 rounded-sm border border-orange-200 hover:shadow-sm p-4 transition">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-orange-600">Pending</div>
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-orange-700 mb-1">{pending}</div>
        <div className="text-xs text-orange-600">{pendingPercentage}% of total</div>
      </div>
    </div>
  );
}