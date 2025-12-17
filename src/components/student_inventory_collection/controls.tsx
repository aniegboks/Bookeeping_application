// components/student_inventory_collection/controls.tsx
"use client";

import { Plus, Upload, X } from "lucide-react";
import { Student } from "@/lib/types/students";
import { SchoolClass } from "@/lib/types/classes";
import { AcademicSession } from "@/lib/types/academic_session";
import { InventoryItem } from "@/lib/types/inventory_item";

interface ControlsProps {
  filterStudentId: string;
  onFilterStudentIdChange: (value: string) => void;
  filterClassId: string;
  onFilterClassIdChange: (value: string) => void;
  filterSessionTermId: string;
  onFilterSessionTermIdChange: (value: string) => void;
  filterInventoryItemId: string;
  onFilterInventoryItemIdChange: (value: string) => void;
  filterReceived: string;
  onFilterReceivedChange: (value: string) => void;
  filterEligible: string;
  onFilterEligibleChange: (value: string) => void;
  onAdd: () => void;
  onBulkAdd: () => void;
  canCreate?: boolean;
  students: Student[];
  classes: SchoolClass[];
  sessionTerms: AcademicSession[];
  inventoryItems: InventoryItem[];
}

export default function Controls({
  filterStudentId,
  onFilterStudentIdChange,
  filterClassId,
  onFilterClassIdChange,
  filterSessionTermId,
  onFilterSessionTermIdChange,
  filterInventoryItemId,
  onFilterInventoryItemIdChange,
  filterReceived,
  onFilterReceivedChange,
  filterEligible,
  onFilterEligibleChange,
  onAdd,
  onBulkAdd,
  canCreate = true,
  students,
  classes,
  sessionTerms,
  inventoryItems,
}: ControlsProps) {
  // Check if any filters are active
  const hasActiveFilters = 
    filterStudentId || 
    filterClassId || 
    filterSessionTermId || 
    filterInventoryItemId || 
    filterReceived || 
    filterEligible;

  // Clear all filters
  const handleClearFilters = () => {
    onFilterStudentIdChange("");
    onFilterClassIdChange("");
    onFilterSessionTermIdChange("");
    onFilterInventoryItemIdChange("");
    onFilterReceivedChange("");
    onFilterEligibleChange("");
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Filter Collections</h2>
        
        {/* Only show action buttons if user has create permission */}
        {canCreate && (
          <div className="flex gap-2">
            <button
              onClick={onAdd}
              className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-sm transition flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Collection
            </button>
            <button
              onClick={onBulkAdd}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-sm transition flex items-center gap-2 whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Student Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Student
            </label>
            <select
              value={filterStudentId}
              onChange={(e) => onFilterStudentIdChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={filterClassId}
              onChange={(e) => onFilterClassIdChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Session Term Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Session Term
            </label>
            <select
              value={filterSessionTermId}
              onChange={(e) => onFilterSessionTermIdChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sessions</option>
              {sessionTerms.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* Inventory Item Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Inventory Item
            </label>
            <select
              value={filterInventoryItemId}
              onChange={(e) => onFilterInventoryItemIdChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Items</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Received Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Received Status
            </label>
            <select
              value={filterReceived}
              onChange={(e) => onFilterReceivedChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="true">Received</option>
              <option value="false">Not Received</option>
            </select>
          </div>

          {/* Eligible Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Eligible Status
            </label>
            <select
              value={filterEligible}
              onChange={(e) => onFilterEligibleChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="true">Eligible</option>
              <option value="false">Not Eligible</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}