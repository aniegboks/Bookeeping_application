"use client";

import { useState, useMemo } from "react";
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

import { User as UserType } from "@/lib/types/user";
import { Role } from "@/lib/types/roles";

interface UserTableProps {
  users: UserType[];
  roles: Role[];
  onEdit: (user: UserType) => void;
  onDelete: (user: UserType) => void;
  loading?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function UserTable({
  users,
  roles,
  onEdit,
  onDelete,
  loading = false,
  canUpdate = true,
  canDelete = true,
}: UserTableProps) {

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // ✅ Normalize users: convert `role` → `roles[]`
  const normalizedUsers = useMemo(() => {
    return users.map((u) => ({
      ...u,
      roles: Array.isArray(u.roles)
        ? u.roles
        : [],
    }));
  }, [users]);

  // Map role.code → role.name
  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((role) => map.set(role.code, role.name));
    return map;
  }, [roles]);

  const getRoleDisplayName = (roleCode: string): string =>
    roleMap.get(roleCode) || roleCode;

  const totalPages = Math.ceil(normalizedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = normalizedUsers.slice(startIndex, endIndex);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

  // LOADING
  if (loading) {
    return (
      <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C63] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading users...</p>
      </div>
    );
  }

  // EMPTY
  if (normalizedUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new user.
        </p>
      </div>
    );
  }

  // TABLE
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Roles
              </th>
              {/* Only show Actions column if user has any action permission */}
              {hasAnyActionPermission && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">

                {/* NAME */}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <User className="text-[#3D4C63] h-4 w-4" />
                    <span className="max-w-[200px] truncate">{user.name || "—"}</span>
                  </div>
                </td>

                {/* EMAIL */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Mail className="text-[#3D4C63] h-4 w-4" />
                    <span className="max-w-[250px] truncate">{user.email || "—"}</span>
                  </div>
                </td>

                {/* PHONE */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Phone className="text-[#3D4C63] h-4 w-4" />
                    <span>{user.phone || "—"}</span>
                  </div>
                </td>

                {/* ROLES */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0 ? (
                      user.roles.map((roleCode: string) => {
                        const roleName = getRoleDisplayName(roleCode);
                        return (
                          <span
                            key={roleCode}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3D4C63] text-white"
                            title={`${roleName} (${roleCode})`}
                          >
                            <Shield className="h-3 w-3" />
                            {roleName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-400">No roles assigned</span>
                    )}

                  </div>
                </td>

                {/* ACTIONS - Only show if user has permissions */}
                {hasAnyActionPermission && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {/* Only show Edit button if user can update */}
                      {canUpdate && (
                        <button
                          onClick={() => onEdit(user)}
                          className="p-2 text-[#3D4C63] hover:bg-blue-50 rounded-lg"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}

                      {/* Only show Delete button if user can delete */}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* PAGINATION */}
      <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
        <span className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, normalizedUsers.length)} of{" "}
          {normalizedUsers.length} users
        </span>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Page {currentPage} / {totalPages || 1}
          </span>

          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-sm border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-sm border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}