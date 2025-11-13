"use client";

import { useState } from "react";
import { RolePrivilege } from "@/lib/types/roles_privilage";
import { Edit, Trash2, RefreshCw, ShieldCheck } from "lucide-react";

interface RolePrivilegesTableProps {
  privileges: RolePrivilege[];
  onEdit: (privilege: RolePrivilege) => void;
  onDelete: (privilege: RolePrivilege) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function RolePrivilegesTable({
  privileges,
  onEdit,
  onDelete,
  loading,
  onRefresh,
}: RolePrivilegesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(privileges.length / pageSize);
  const paginatedPrivileges = privileges.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Helper function to normalize status for display
  const getStatusDisplay = (status: string | boolean | any): { text: string; isActive: boolean } => {
    // Handle boolean values
    if (typeof status === 'boolean') {
      return {
        text: status ? 'active' : 'inactive',
        isActive: status
      };
    }
    
    // Handle string values
    const statusStr = String(status).toLowerCase();
    const isActive = statusStr === 'active' || statusStr === 'true' || statusStr === '1';
    
    return {
      text: isActive ? 'active' : 'inactive',
      isActive
    };
  };

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-[#171D26] tracking-tight">
          All Role Privileges
        </h2>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-sm text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPrivileges.length > 0 ? (
              paginatedPrivileges.map((privilege) => {
                const statusDisplay = getStatusDisplay(privilege.status);
                
                return (
                  <tr key={privilege.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#171D26] font-medium">
                      {privilege.role_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#171D26] max-w-md">
                      {privilege.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusDisplay.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusDisplay.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(privilege.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                      <button
                        onClick={() => onEdit(privilege)}
                        className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50"
                        title="Edit privilege"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(privilege)}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                        title="Delete privilege"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <ShieldCheck className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No privileges found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Role privileges define what actions users can perform.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={onRefresh}
                      className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm flex items-center gap-2 mx-auto hover:bg-[#495C79] transition-colors"
                    >
                      <RefreshCw size={16} /> Refresh List
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            ‹
          </button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}