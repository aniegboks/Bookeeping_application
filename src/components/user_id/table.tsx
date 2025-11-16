"use client";
import { useState, useMemo } from "react";
import { Edit, Trash2, Mail, Phone, User as UserIcon, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { User } from "@/lib/types/user";
import { Role } from "@/lib/types/roles";

interface UserTableProps {
  users: User[];
  roles: Role[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  loading?: boolean;
}

export default function UserTable({
  users,
  roles,
  onEdit,
  onDelete,
  loading = false,
}: UserTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Create a map of role codes to role names for efficient lookup
  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((role) => {
      map.set(role.code, role.name);
    });
    return map;
  }, [roles]);

  // Helper function to get role display name
  const getRoleDisplayName = (roleCode: string): string => {
    return roleMap.get(roleCode) || roleCode;
  };

  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C63] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new user.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <UserIcon className="text-[#3D4C63] h-4 w-4 flex-shrink-0" />
                    <span className="max-w-[200px] truncate" title={user.name}>
                      {user.name || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Mail className="text-[#3D4C63] h-4 w-4 flex-shrink-0" />
                    <span className="max-w-[250px] truncate" title={user.email}>
                      {user.email || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Phone className="text-[#3D4C63] h-4 w-4 flex-shrink-0" />
                    <span>{user.phone || "—"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((roleCode) => {
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-[#3D4C63] hover:text-[#495C79] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
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
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} users
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Page {currentPage} / {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-sm border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white/70 backdrop-blur-sm transition"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-sm border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white/70 backdrop-blur-sm transition"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}