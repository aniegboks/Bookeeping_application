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

export default function RolesPage() {
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
    } catch (err: unknown) {
      console.error("Failed to load roles:", err);
      toast.error("Failed to load roles");
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
      toast.error("No data to export!");
      return;
    }

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

    saveAs(blob, `roles_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Spreadsheet exported successfully!");
  };

  // Submit form (create/update)
  const handleFormSubmit = async (data: CreateRolePayload | UpdateRolePayload) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(editingRole ? "Updating role..." : "Creating role...");

    try {
      if (editingRole) {
        await rolesApi.update(editingRole.code, data as UpdateRolePayload);
        toast.success("Role updated successfully!");
      } else {
        await rolesApi.create(data as CreateRolePayload);
        toast.success("Role created successfully!");
      }

      setShowForm(false);
      setEditingRole(null);
      await loadRoles();
    } catch (err: unknown) {
      console.error("Form submission failed:", err);
      toast.error("Failed to save role");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteRequest = (role: Role) => {
    setDeletingRole(role);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingRole) return;
    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting role...");

    try {
      await rolesApi.delete(deletingRole.code);
      toast.success("Role deleted successfully!");
      setShowDeleteModal(false);
      setDeletingRole(null);
      await loadRoles();
    } catch (err: unknown) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete role");
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRole(null);
    toast("Action canceled", { icon: "ℹ️" });
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
          <StatsCards roles={roles} />

          {/* Controls */}
          <div className="flex justify-between items-center mb-4 mt-8">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:ring focus:ring-blue-100"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-sm transition"
              >
                Add Role
              </button>
              <button
                onClick={handleExport}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <RolesTable
            roles={paginatedRoles}
            loading={loading}
            onEdit={(role) => {
              setEditingRole(role);
              setShowForm(true);
            }}
            onDelete={handleDeleteRequest}
            onRefresh={loadRoles}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <p className="text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
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
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingRole(null);
                toast("Delete canceled", { icon: "ℹ️" });
              }}
              isDeleting={isDeleting}
            />
          )}
        </div>
      </Container>
    </div>
  );
}
