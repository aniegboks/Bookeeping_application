"use client";

import { useEffect, useState, useCallback } from "react";
import { Edit, Trash2, XCircle, CircleCheck, RefreshCw } from "lucide-react";
import { StudentInventoryCollection } from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";

//  Mock API (replace with your actual fetch endpoint)
const inventoryApi = {
  async fetchAll(): Promise<StudentInventoryCollection[]> {
    const res = await fetch("/api/proxy/student_inventory_collection"); // Adjust to your actual route
    if (!res.ok) throw new Error("Failed to fetch inventory collections");
    return res.json();
  },
};

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
  // Optional external trigger to reload data after bulk upload
  refreshTrigger?: number;
}

export default function CollectionTable({
  onEdit,
  onDelete,
  students,
  rowsPerPage = 10,
  refreshTrigger,
}: CollectionTableProps) {
  const [collections, setCollections] = useState<StudentInventoryCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch inventory data
  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.fetchAll();
      setCollections(data);
    } catch (err) {
      console.error("Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount + whenever `refreshTrigger` changes (after bulk upload)
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections, refreshTrigger]);

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
        <button
          onClick={fetchCollections}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-[#171D26] text-lg">Student Inventory Collections</h2>
        <button
          onClick={fetchCollections}
          className="flex items-center gap-2 text-sm px-3 py-1.5 bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eligible</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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

                <td
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => onEdit({ ...c, eligible: !c.eligible })}
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

                <td
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => onEdit({ ...c, received: !c.received })}
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

                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(c)}
                      className="text-[#3D4C63] hover:text-[#495C79] transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 p-4 border-t">
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
