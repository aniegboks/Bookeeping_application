"use client";

import { useState } from "react";
import { RolePrivilege } from "@/lib/types/roles_privilage";
import { Edit, Trash2, RefreshCw, ShieldCheck, Save, X } from "lucide-react";
import toast from "react-hot-toast";

interface RolePrivilegesTableProps {
  privileges: RolePrivilege[];
  onEdit: (privilege: RolePrivilege) => void;
  onDelete: (privilege: RolePrivilege) => void;
  onUpdate?: (id: string, updates: Partial<RolePrivilege>) => Promise<void>;
  loading?: boolean;
  onRefresh?: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function RolePrivilegesTable({
  privileges,
  onEdit,
  onDelete,
  onUpdate,
  loading,
  onRefresh,
  canUpdate = true,
  canDelete = true,
}: RolePrivilegesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<boolean>(false);
  const [editingDescription, setEditingDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

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
  const getStatusDisplay = (status: string | boolean | unknown): { text: string; isActive: boolean } => {
    if (typeof status === 'boolean') {
      return {
        text: status ? 'active' : 'inactive',
        isActive: status
      };
    }
    
    const statusStr = String(status).toLowerCase();
    const isActive = statusStr === 'active' || statusStr === 'true' || statusStr === '1';
    
    return {
      text: isActive ? 'active' : 'inactive',
      isActive
    };
  };

  // Start inline editing
  const handleStartEdit = (privilege: RolePrivilege) => {
    // Check permission before starting edit
    if (!canUpdate) {
      toast.error("You don't have permission to update privileges");
      return;
    }
    
    const statusDisplay = getStatusDisplay(privilege.status);
    setEditingId(privilege.id);
    setEditingStatus(statusDisplay.isActive);
    setEditingDescription(privilege.description);
  };

  // Cancel inline editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingStatus(false);
    setEditingDescription("");
  };

  // Save inline changes
  const handleSaveEdit = async (privilege: RolePrivilege) => {
    if (!onUpdate) {
      toast.error("Update function not provided");
      return;
    }

    if (!canUpdate) {
      toast.error("You don't have permission to update privileges");
      return;
    }

    if (!editingDescription.trim()) {
      toast.error("Description cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(privilege.id, {
        description: editingDescription.trim(),
        status: editingStatus ? "active" : "inactive",
      });
      
      toast.success("Privilege updated successfully");
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to update privilege");
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick toggle status (without entering edit mode)
  const handleQuickToggleStatus = async (privilege: RolePrivilege) => {
    if (!onUpdate) {
      toast.error("Update function not provided");
      return;
    }

    if (!canUpdate) {
      toast.error("You don't have permission to update privileges");
      return;
    }

    const currentStatus = getStatusDisplay(privilege.status).isActive;
    const newStatus = currentStatus ? "inactive" : "active";

    try {
      await onUpdate(privilege.id, { status: newStatus });
      toast.success(`Privilege ${newStatus === "active" ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error("Failed to update status");
      console.error("Status toggle error:", error);
    }
  };

  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

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
              {/* Only show Actions column if user has any action permission */}
              {hasAnyActionPermission && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPrivileges.length > 0 ? (
              paginatedPrivileges.map((privilege) => {
                const statusDisplay = getStatusDisplay(privilege.status);
                const isEditing = editingId === privilege.id;
                
                return (
                  <tr key={privilege.id} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#171D26] font-medium">
                      {privilege.role_code}
                    </td>
                    
                    {/* Description - Editable if has update permission */}
                    <td className="px-6 py-4 text-sm text-[#171D26] max-w-md">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          className="w-full border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isSaving}
                        />
                      ) : (
                        privilege.description
                      )}
                    </td>
                    
                    {/* Status - Editable/toggleable if has update permission */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={editingStatus ? "active" : "inactive"}
                          onChange={(e) => setEditingStatus(e.target.value === "active")}
                          className="border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isSaving}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => canUpdate && handleQuickToggleStatus(privilege)}
                          disabled={!canUpdate}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            statusDisplay.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          } ${canUpdate ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
                          title={canUpdate ? "Click to toggle status" : "No permission to change status"}
                        >
                          {statusDisplay.text}
                        </button>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(privilege.created_at)}
                    </td>
                    
                    {/* Actions - only show if user has permissions */}
                    {hasAnyActionPermission && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(privilege)}
                              disabled={isSaving}
                              className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 disabled:opacity-50"
                              title="Save changes"
                            >
                              {isSaving ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {/* Only show Edit button if user can update */}
                            {canUpdate && (
                              <button
                                onClick={() => handleStartEdit(privilege)}
                                className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50"
                                title="Edit privilege"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {/* Only show Delete button if user can delete */}
                            {canDelete && (
                              <button
                                onClick={() => onDelete(privilege)}
                                className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                                title="Delete privilege"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={hasAnyActionPermission ? 5 : 4} className="text-center py-12">
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