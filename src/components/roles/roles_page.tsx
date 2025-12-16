"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

// API
import { rolesApi } from "@/lib/roles";

// Types
import { Role, CreateRolePayload, UpdateRolePayload } from "@/lib/types/roles";

// Components
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import RolesTable from "@/components/roles/table";
import RoleForm from "@/components/roles/form";
import DeleteRoleModal from "@/components/roles/delete_modal";
import StatsCards from "@/components/roles/stats_card";

// Permissions
import { useUser } from "@/contexts/UserContext";

// Safe error message extractor
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default function RolesPage() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();
  
  // Check permissions for different actions
  const canCreate = canPerformAction("Roles", "create");
  const canUpdate = canPerformAction("Roles", "update");
  const canDelete = canPerformAction("Roles", "delete");

  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rolesPerPage] = useState(8);

  // Load all roles
  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await rolesApi.getAll();
      setRoles(data);
      
      // Show success message on initial load
      if (data.length > 0 && initialLoading) {
        toast.success(`Successfully loaded ${data.length} role${data.length !== 1 ? 's' : ''}`, {
          duration: 3000,
          icon: '✅',
        });
      }
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      console.error("Failed to load roles:", err);
      toast.error(errorMsg, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Filter + Paginate
  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);
  const startIdx = (currentPage - 1) * rolesPerPage;
  const paginatedRoles = filteredRoles.slice(startIdx, startIdx + rolesPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Export to Excel
  const handleExport = () => {
    if (filteredRoles.length === 0) {
      toast.error("Export failed: No roles available to export. Please add some roles first.", {
        duration: 4000,
        icon: '📭',
      });
      return;
    }

    try {
      const dataToExport = filteredRoles.map((r) => ({
        Code: r.code,
        Name: r.name,
        Status: r.status,
        "Created At": new Date(r.created_at).toLocaleString(),
        "Updated At": new Date(r.updated_at).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Roles");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const filename = `roles_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blob, filename);
      
      toast.success(`✅ Export successful! ${filteredRoles.length} role${filteredRoles.length !== 1 ? 's' : ''} exported to &ldquo;${filename}&rdquo;`, {
        duration: 4000,
        icon: '📊',
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed: Unable to generate Excel file. Please try again or contact support.", {
        duration: 5000,
        icon: '❌',
      });
    }
  };

  // Open create form
  const handleCreateClick = () => {
    // Check permission before opening form
    if (!canCreate) {
      toast.error("Access denied: You don't have permission to create roles. Please contact your administrator.", {
        duration: 4000,
        icon: '🚫',
      });
      return;
    }
    setEditingRole(null);
    setShowForm(true);
  };

  // Open edit form
  const handleEditClick = (role: Role) => {
    // Check permission before opening form
    if (!canUpdate) {
      toast.error("Access denied: You don't have permission to update roles. Please contact your administrator.", {
        duration: 4000,
        icon: '🚫',
      });
      return;
    }
    setEditingRole(role);
    setShowForm(true);
  };

  // Submit form (create/update)
  const handleFormSubmit = async (data: CreateRolePayload | UpdateRolePayload) => {
    // Client-side validation
    if ('code' in data && !data.code?.trim()) {
      toast.error("Validation error: Role code is required and cannot be empty.", {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }

    if (!data.name?.trim()) {
      toast.error("Validation error: Role name is required and cannot be empty.", {
        duration: 4000,
        icon: '⚠️',
      });
      return;
    }

    // Validate role code format (alphanumeric, underscore, hyphen)
    if ('code' in data && !/^[A-Za-z0-9_-]+$/.test(data.code || '')) {
      toast.error("Validation error: Role code can only contain letters, numbers, underscores, and hyphens.", {
        duration: 5000,
        icon: '⚠️',
      });
      return;
    }

    // Check for duplicate role code when creating
    if (!editingRole && 'code' in data) {
      const duplicateRole = roles.find(r => r.code.toLowerCase() === data.code?.toLowerCase());
      if (duplicateRole) {
        toast.error(`Role already exists: A role with code &ldquo;${data.code}&rdquo; already exists in the system. Please use a different code.`, {
          duration: 5000,
          icon: '🚫',
        });
        return;
      }
    }

    // Double-check permissions before submitting
    if (editingRole && !canUpdate) {
      toast.error("Access denied: You don't have permission to update roles.", {
        duration: 4000,
        icon: '🚫',
      });
      return;
    }
    if (!editingRole && !canCreate) {
      toast.error("Access denied: You don't have permission to create roles.", {
        duration: 4000,
        icon: '🚫',
      });
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(editingRole ? "Updating role..." : "Creating role...");

    try {
      if (editingRole) {
        await rolesApi.update(editingRole.code, data as UpdateRolePayload);
        toast.success(`✅ Role updated successfully! Role &ldquo;${data.name}&rdquo; (${editingRole.code}) has been updated with the new information.`, {
          duration: 4000,
          icon: '✨',
        });
      } else {
        const created = await rolesApi.create(data as CreateRolePayload);
        toast.success(`✅ Role created successfully! New role &ldquo;${created.name}&rdquo; (${created.code}) has been added to the system.`, {
          duration: 4000,
          icon: '🎉',
        });
      }

      setShowForm(false);
      setEditingRole(null);
      await loadRoles();
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      console.error("Form submission failed:", err);
      toast.error(errorMsg, {
        duration: 6000,
        icon: '❌',
      });
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteRequest = (role: Role) => {
    // Check permission before opening delete modal
    if (!canDelete) {
      toast.error("Access denied: You don't have permission to delete roles. Please contact your administrator.", {
        duration: 4000,
        icon: '🚫',
      });
      return;
    }
    setDeletingRole(role);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingRole) return;
    
    // Double-check permission before deleting
    if (!canDelete) {
      toast.error("Access denied: You don't have permission to delete roles.", {
        duration: 4000,
        icon: '🚫',
      });
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading(`Deleting role &ldquo;${deletingRole.name}&rdquo;...`);

    try {
      await rolesApi.delete(deletingRole.code);
      toast.success(`✅ Role deleted successfully! Role &ldquo;${deletingRole.name}&rdquo; (${deletingRole.code}) has been permanently removed from the system.`, {
        duration: 4000,
        icon: '🗑️',
      });
      setShowDeleteModal(false);
      setDeletingRole(null);
      await loadRoles();
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      console.error("Delete failed:", err);
      toast.error(errorMsg, {
        duration: 6000,
        icon: '❌',
      });
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRole(null);
    toast("Form canceled. No changes were made.", { 
      icon: "ℹ️",
      duration: 3000 
    });
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingRole(null);
    toast("Delete canceled. Role was not removed.", { 
      icon: "ℹ️",
      duration: 3000 
    });
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-6">
      <Container>
        <div className="mt-2 pb-8">
          {/* Stats Cards */}

          {/* Controls */}
          <div className="flex justify-between items-center mb-4 mt-8">
            <input
              type="text"
              placeholder="Search roles by name or code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:ring focus:ring-blue-100"
            />
            <div className="flex gap-3">
              {/* Only show Add Role button if user has create permission */}
              {canCreate && (
                <button
                  onClick={handleCreateClick}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-sm transition"
                >
                  Add Role
                </button>
              )}
              <button
                onClick={handleExport}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>

          {/* No results message */}
          {filteredRoles.length === 0 && !loading && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              No roles found matching &ldquo;{searchTerm}&rdquo;. Try a different search term.
            </div>
          )}

          {/* Table */}
          <RolesTable
            roles={paginatedRoles}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteRequest}
            onRefresh={loadRoles}
            // Pass permissions to the table
            canUpdate={canUpdate}
            canDelete={canDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <p className="text-gray-600">
                Showing {startIdx + 1}-{Math.min(startIdx + rolesPerPage, filteredRoles.length)} of {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''} (Page {currentPage} of {totalPages})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Prev
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <RoleForm
              role={editingRole || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Delete Modal */}
          {showDeleteModal && deletingRole && (
            <DeleteRoleModal
              roleCode={deletingRole.code}
              roleName={deletingRole.name}
              onConfirm={confirmDelete}
              onCancel={handleDeleteCancel}
              isDeleting={isDeleting}
            />
          )}
        </div>
      </Container>
    </div>
  );
}