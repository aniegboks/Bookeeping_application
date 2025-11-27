"use client";

import { useState } from "react";
import { Role } from "@/lib/types/roles";
import { Edit, Trash2, RefreshCw, Shield } from "lucide-react";

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  loading?: boolean;
  onRefresh?: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function RolesTable({
  roles,
  onEdit,
  onDelete,
  loading,
  onRefresh,
  canUpdate = true,
  canDelete = true,
}: RolesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(roles.length / pageSize);
  const paginatedRoles = roles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        <h2 className="text-xl font-semibold text-[#171D26] tracking-tight">All Roles</h2>

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
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
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
          {paginatedRoles.length > 0 ? (
            paginatedRoles.map((role) => (
              <tr key={role.code} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#171D26]">
                  {role.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#171D26]">
                  {role.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      role.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {role.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(role.created_at)}
                </td>
                {/* Only show action buttons if user has permissions */}
                {hasAnyActionPermission && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                    {/* Only show Edit button if user can update */}
                    {canUpdate && (
                      <button
                        onClick={() => onEdit(role)}
                        className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50"
                        title="Edit role"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    {/* Only show Delete button if user can delete */}
                    {canDelete && (
                      <button
                        onClick={() => onDelete(role)}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                        title="Delete role"
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
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No roles</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Roles help manage user permissions in the system.
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