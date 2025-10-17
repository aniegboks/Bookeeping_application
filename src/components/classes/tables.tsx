"use client";

import { useState } from "react";
import { Edit, Trash2, User as UserIcon } from "lucide-react";
import { SchoolClass } from "@/lib/types/classes";
import { User } from "@/lib/types/user";
import { ClassTeacher } from "@/lib/types/class_teacher";

interface ClassTableProps {
  classes: SchoolClass[];
  onEdit: (schoolClass: SchoolClass) => void;
  onDelete: (schoolClass: SchoolClass) => void;
  loading?: boolean;
  users: User[];
  classTeachers: ClassTeacher[];
}

export default function ClassTable({
  classes,
  onEdit,
  onDelete,
  loading = false,
  users,
  classTeachers,
}: ClassTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClasses = classes.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // Helper to get teacher name for a class
  const getTeacherName = (classId: string) => {
    const assignedTeacher = classTeachers.find((t) => t.class_id === classId);
    if (!assignedTeacher) return "Unassigned";
    const user = users.find((u) => u.id === assignedTeacher.teacher_id);
    return user?.username || user?.name || assignedTeacher?.name || "Unknown";
  };

  // Helper to get user name
  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return "—";
    const user = users.find((u) => u.id === userId);
    return user?.username || user?.name || "Unknown User";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C63] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading classes...</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No classes found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedClasses.map((schoolClass) => (
              <tr key={schoolClass.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserIcon size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{schoolClass.name}</div>
                      <div className="text-xs text-gray-500 max-w-[200px] truncate" title={schoolClass.id}>{schoolClass.id}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getTeacherName(schoolClass.id)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    schoolClass.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {schoolClass.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" title={getUserName(schoolClass.created_by)}>
                  {getUserName(schoolClass.created_by)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(schoolClass.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(schoolClass.updated_at).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(schoolClass)}
                      className="p-2 text-[#3D4C63] hover:text-[#495C79] rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(schoolClass)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{startIndex + 1}</span>–<span className="font-medium">{Math.min(startIndex + itemsPerPage, classes.length)}</span> of <span className="font-medium">{classes.length}</span> classes
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 text-sm rounded-md border ${currentPage === 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 text-sm rounded-md border ${currentPage === totalPages ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
