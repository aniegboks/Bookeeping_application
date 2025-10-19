"use client";

import { Search, Download, Printer } from "lucide-react";

interface ReportSearchExportProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onExportExcel: () => void;
  onPrint: () => void;
}

export function ReportSearchExport({
  searchTerm,
  onSearchChange,
  onExportExcel,
  onPrint,
}: ReportSearchExportProps) {
  return (
    <div className="bg-white rounded-sm border border-gray-200 p-4 mb-6 print:hidden">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name, admission number, item..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onExportExcel}
            className="bg-[#3D4C63] rounded-sm hover:bg-[#495C79] text-white px-4 py-2 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={onPrint}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print/PDF
          </button>
        </div>
      </div>
    </div>
  );
}