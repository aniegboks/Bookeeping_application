"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StudentInventoryCollection } from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";
import { SchoolClass } from "@/lib/types/classes";
import { Category } from "@/lib/types/categories";

interface ReportTablePaginationProps {
  collections: StudentInventoryCollection[];
  students: Student[];
  inventoryItems: InventoryItem[];
  academicSessions: AcademicSession[];
  users: User[];
  classes: SchoolClass[];
  categories: Category[];
}

export function ReportTablePagination({
  collections,
  students,
  inventoryItems,
  academicSessions,
  users,
  classes,
  categories,
}: ReportTablePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(collections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCollections = collections.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div>
      {/* Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Admission No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Eligible</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Received</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Received Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Given By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCollections.map((collection) => {
                const student = students.find((s) => s.id === collection.student_id);
                const item = inventoryItems.find((i) => i.id === collection.inventory_item_id);
                const session = academicSessions.find((s) => s.id === collection.session_term_id);
                const classObj = classes.find((cl) => cl.id === collection.class_id);
                const givenByUser = users.find((u) => u.id === collection.given_by);
                const categoryItem = categories.find((cat) => cat.id === item?.category_id);

                return (
                  <tr key={collection.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      {student
                        ? `${student.first_name} ${student.middle_name || ""} ${student.last_name}`.trim()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{student?.admission_number || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-700">{classObj?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-900">{item?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-700">{categoryItem?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{collection.qty}</td>
                    <td className="px-4 py-3">
                      {collection.eligible ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {collection.received ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {collection.received_date
                        ? new Date(collection.received_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{givenByUser?.name || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {collections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No records found. Use filters to generate a report.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {collections.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Rows per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700 ml-4">
              Showing {startIndex + 1} to {Math.min(endIndex, collections.length)} of{" "}
              {collections.length} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && goToPage(page)}
                disabled={page === '...'}
                className={`px-3 py-1 border rounded-md text-sm ${
                  page === currentPage
                    ? 'bg-[#3D4C63] text-white border-[#3D4C63]'
                    : page === '...'
                    ? 'border-transparent cursor-default'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}