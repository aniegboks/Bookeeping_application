"use client";

import { useState } from "react";
import { RoleMenu } from "@/lib/types/roles_menu";
import { Edit, Trash2, RefreshCw, Link2 } from "lucide-react";

interface RoleMenusTableProps {
  roleMenus: RoleMenu[];
  onEdit: (roleMenu: RoleMenu) => void;
  onDelete: (roleMenu: RoleMenu) => void;
  loading?: boolean;
  onRefresh?: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function RoleMenusTable({
  roleMenus,
  onEdit,
  onDelete,
  loading,
  onRefresh,
  canUpdate = true,
  canDelete = true,
}: RoleMenusTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(roleMenus.length / pageSize);
  const paginatedRoleMenus = roleMenus.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-[#171D26] tracking-tight">
          All Role-Menu Assignments
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
                Role Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Menu Caption
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Menu Route
              </th>
              {/* Only show Actions column if user has any action permission */}
              {hasAnyActionPermission && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRoleMenus.length > 0 ? (
              paginatedRoleMenus.map((roleMenu) => (
                <tr key={roleMenu.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#171D26] font-medium">
                    {roleMenu.role_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {roleMenu.role?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#171D26]">
                    {roleMenu.menu?.caption || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {roleMenu.menu?.route || "N/A"}
                  </td>
                  {/* Only show action buttons if user has permissions */}
                  {hasAnyActionPermission && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                      {/* Only show Edit button if user can update */}
                      {canUpdate && (
                        <button
                          onClick={() => onEdit(roleMenu)}
                          className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50"
                          title="Edit assignment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {/* Only show Delete button if user can delete */}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(roleMenu)}
                          className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                          title="Delete assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={hasAnyActionPermission ? 5 : 4} className="text-center py-12">
                  <Link2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No role-menu assignments found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Assign menus to roles to control navigation access.
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