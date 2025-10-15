import { useState, useMemo } from "react";
import { Edit, Trash2, Mail, Calendar } from "lucide-react";
import { ClassTeacher } from "@/lib/types/class_teacher";

interface TeacherTableProps {
  teachers: ClassTeacher[];
  onEdit: (teacher: ClassTeacher) => void;
  onDelete: (teacher: ClassTeacher) => void;
  loading?: boolean;
  itemsPerPage?: number; // optional, default 10
}

export default function TeacherTable({
  teachers,
  onEdit,
  onDelete,
  loading = false,
  itemsPerPage = 10,
}: TeacherTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(teachers.length / itemsPerPage);

  const currentTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return teachers.slice(startIndex, startIndex + itemsPerPage);
  }, [teachers, currentPage, itemsPerPage]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C63] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading class teachers...</p>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No class teacher assignments found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teacher Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session Term ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTeachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Mail className="text-gray-400 h-4 w-4" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {teacher.email}
                      </div>
                      <div className="text-xs text-gray-500 max-w-[150px] truncate" title={teacher.teacher_id}>
                        ID: {teacher.teacher_id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-[120px] truncate" title={teacher.class_id}>
                    {teacher.class_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-[120px] truncate" title={teacher.session_term_id}>
                    {teacher.session_term_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {teacher.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${teacher.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {teacher.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(teacher.assigned_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(teacher)}
                      className="p-2 text-[#3D4C63] hover:text-[#495C79] rounded-lg transition-colors"
                      title="Edit Assignment"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(teacher)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Assignment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 text-sm gap-4">

        <span>
          {currentPage} / {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 bg-white"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 bg-white"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
