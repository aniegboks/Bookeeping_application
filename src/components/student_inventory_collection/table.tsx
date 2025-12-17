"use client";

import { useState } from "react";
import { Edit, Trash2, XCircle, CircleCheck, RefreshCw } from "lucide-react";
import { StudentInventoryCollection } from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";

interface CollectionTableProps {
  collections: StudentInventoryCollection[];
  onEdit: (collection: StudentInventoryCollection) => void;
  onDelete: (collection: StudentInventoryCollection) => void;
  loading?: boolean;
  students: Student[];
  inventoryItems?: InventoryItem[];
  academicSessions?: AcademicSession[];
  users?: User[];
  rowsPerPage?: number;
  onRefresh?: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function CollectionTable({
  collections,
  onEdit,
  onDelete,
  loading = false,
  students,
  academicSessions = [],
  rowsPerPage = 10,
  onRefresh,
  canUpdate = true,
  canDelete = true,
}: CollectionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination
  const totalPages = Math.ceil(collections.length / rowsPerPage);
  const paginatedCollections = collections.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Helpers
  const getStudentFullName = (id: string) => {
    const s = students.find((st) => st.id === id);
    return s
      ? [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ")
      : "—";
  };

  const getAdmissionNumber = (id: string) =>
    students.find((s) => s.id === id)?.admission_number || "—";

  const getSessionName = (id: string) =>
    academicSessions.find((s) => s.id === id)?.name || "—";

  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

  // UI Rendering
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C63] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading collections...</p>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No inventory collections found</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-[#171D26] text-lg">
          Student Inventory Collections ({collections.length})
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 text-sm px-3 py-1.5 bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eligible</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              {hasAnyActionPermission && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCollections.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{getStudentFullName(c.student_id)}</div>
                    <div className="text-gray-500 text-xs">{getAdmissionNumber(c.student_id)}</div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  {c.school_classes?.name || "—"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  {getSessionName(c.session_term_id)}
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-[150px]">
                    <div className="font-medium">{c.inventory_items?.name || "—"}</div>
                    <div className="text-xs text-gray-500">
                      {c.inventory_items?.categories?.name || "—"}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {c.qty}
                  </span>
                </td>

                {/* Eligible - only clickable if can update */}
                <td
                  className={`px-6 py-4 ${canUpdate ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => canUpdate && onEdit({ ...c, eligible: !c.eligible })}
                  title={canUpdate ? "Click to toggle" : "No permission to change"}
                >
                  {c.eligible ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CircleCheck className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                    </span>
                  )}
                </td>

                {/* Received - only clickable if can update */}
                <td
                  className={`px-6 py-4 ${canUpdate ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => canUpdate && onEdit({ ...c, received: !c.received })}
                  title={canUpdate ? "Click to toggle" : "No permission to change"}
                >
                  {c.received ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CircleCheck className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {c.received_date ? new Date(c.received_date).toLocaleDateString() : "—"}
                </td>

                {hasAnyActionPermission && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => onEdit(c)}
                          className="text-[#3D4C63] hover:text-[#495C79] transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(c)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 p-4 border-t">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({collections.length} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}