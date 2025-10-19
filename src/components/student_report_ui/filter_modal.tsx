"use client";

import { Filter, X } from "lucide-react";
import { StudentInventoryCollectionFilters } from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { SchoolClass } from "@/lib/types/classes";
import SmallLoader from "@/components/ui/small_loader";

interface ReportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: StudentInventoryCollectionFilters;
  setFilters: (filters: StudentInventoryCollectionFilters) => void;
  students: Student[];
  classes: SchoolClass[];
  academicSessions: AcademicSession[];
  inventoryItems: InventoryItem[];
  onGenerate: () => void;
  onClear: () => void;
  loading: boolean;
}

export function ReportFilterModal({
  isOpen,
  onClose,
  filters,
  setFilters,
  students,
  classes,
  academicSessions,
  inventoryItems,
  onGenerate,
  onClear,
  loading,
}: ReportFilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Student Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student
              </label>
              <select
                value={filters.student_id || ""}
                onChange={(e) => setFilters({ ...filters, student_id: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.admission_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={filters.class_id || ""}
                onChange={(e) => setFilters({ ...filters, class_id: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Term Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Term
              </label>
              <select
                value={filters.session_term_id || ""}
                onChange={(e) =>
                  setFilters({ ...filters, session_term_id: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sessions</option>
                {academicSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.session} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Inventory Item Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inventory Item
              </label>
              <select
                value={filters.inventory_item_id || ""}
                onChange={(e) =>
                  setFilters({ ...filters, inventory_item_id: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Items</option>
                {inventoryItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Eligible Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eligible Status
              </label>
              <select
                value={filters.eligible === undefined ? "" : filters.eligible.toString()}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    eligible: e.target.value === "" ? undefined : e.target.value === "true",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Eligible</option>
                <option value="false">Not Eligible</option>
              </select>
            </div>

            {/* Received Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Received Status
              </label>
              <select
                value={filters.received === undefined ? "" : filters.received.toString()}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    received: e.target.value === "" ? undefined : e.target.value === "true",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Received</option>
                <option value="false">Not Received</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <button
            onClick={onGenerate}
            disabled={loading}
            className="flex bg-[#3D4C63] rounded-sm hover:bg-[#495C79] text-white px-4 py-2 transition items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex gap-2 items-center">
                <SmallLoader />
                Searching...
              </span>
            ) : (
              "Generate Report"
            )}
          </button>
          <div className="flex gap-4">
            <button
              onClick={onClear}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={onClose}
              className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md border border-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}